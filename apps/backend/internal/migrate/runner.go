package migrate

import (
    "database/sql"
    "errors"
    "fmt"
    "io/fs"
    "os"
    "path/filepath"
    "regexp"
    "sort"
    "strings"
    "time"
)

var (
    upPattern   = regexp.MustCompile(`^(\d+)_.*\.up\.sql$`)
    downPattern = regexp.MustCompile(`^(\d+)_.*\.down\.sql$`)
)

type Migration struct {
    Version int
    UpPath  string
    DownPath string
}

// DiscoverMigrations scans a directory and pairs *.up.sql with *.down.sql
func DiscoverMigrations(dir string) ([]Migration, error) {
    entries := map[int]*Migration{}

    err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
        if err != nil {
            return err
        }
        if d.IsDir() {
            return nil
        }
        base := filepath.Base(path)
        if m := upPattern.FindStringSubmatch(base); m != nil {
            v, _ := atoi(m[1])
            mig := entries[v]
            if mig == nil { mig = &Migration{Version: v} }
            mig.UpPath = path
            entries[v] = mig
        } else if m := downPattern.FindStringSubmatch(base); m != nil {
            v, _ := atoi(m[1])
            mig := entries[v]
            if mig == nil { mig = &Migration{Version: v} }
            mig.DownPath = path
            entries[v] = mig
        }
        return nil
    })
    if err != nil {
        return nil, err
    }

    list := make([]Migration, 0, len(entries))
    for _, m := range entries {
        // Only consider migrations that have an up script
        if m.UpPath != "" {
            list = append(list, *m)
        }
    }
    sort.Slice(list, func(i, j int) bool { return list[i].Version < list[j].Version })
    return list, nil
}

// EnsureSchemaMigrations ensures tracking table exists
func EnsureSchemaMigrations(db *sql.DB) error {
    _, err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at DATETIME NOT NULL
    )`)
    return err
}

func currentVersion(db *sql.DB) (int, error) {
    var v sql.NullInt64
    row := db.QueryRow(`SELECT MAX(version) FROM schema_migrations`)
    if err := row.Scan(&v); err != nil {
        return 0, err
    }
    if !v.Valid { return 0, nil }
    return int(v.Int64), nil
}

func recordApplied(db *sql.DB, v int) error {
    _, err := db.Exec(`INSERT INTO schema_migrations(version, applied_at) VALUES(?, ?)`, v, time.Now().UTC())
    return err
}

func recordReverted(db *sql.DB, v int) error {
    _, err := db.Exec(`DELETE FROM schema_migrations WHERE version = ?`, v)
    return err
}

// ApplyUpToLatest applies all pending up migrations
func ApplyUpToLatest(db *sql.DB, dir string) error {
    if err := EnsureSchemaMigrations(db); err != nil { return err }
    migs, err := DiscoverMigrations(dir)
    if err != nil { return err }
    curr, err := currentVersion(db)
    if err != nil { return err }
    for _, m := range migs {
        if m.Version <= curr { continue }
        if err := execSQLFile(db, m.UpPath); err != nil {
            return fmt.Errorf("apply up %d failed: %w", m.Version, err)
        }
        if err := recordApplied(db, m.Version); err != nil { return err }
    }
    return nil
}

// ApplyDownOne reverts the latest applied migration (one step)
func ApplyDownOne(db *sql.DB, dir string) error {
    if err := EnsureSchemaMigrations(db); err != nil { return err }
    migs, err := DiscoverMigrations(dir)
    if err != nil { return err }
    curr, err := currentVersion(db)
    if err != nil { return err }
    if curr == 0 { return errors.New("no migrations applied") }
    // find the migration with version=curr
    var target *Migration
    for i := range migs {
        if migs[i].Version == curr { target = &migs[i]; break }
    }
    if target == nil {
        return fmt.Errorf("current version %d not found among migrations", curr)
    }
    if target.DownPath == "" {
        return fmt.Errorf("no down migration for version %d", curr)
    }
    if err := execSQLFile(db, target.DownPath); err != nil {
        return fmt.Errorf("apply down %d failed: %w", curr, err)
    }
    return recordReverted(db, curr)
}

// ApplyToVersion migrates up or down to the specified version
func ApplyToVersion(db *sql.DB, dir string, target int) error {
    if err := EnsureSchemaMigrations(db); err != nil { return err }
    migs, err := DiscoverMigrations(dir)
    if err != nil { return err }
    curr, err := currentVersion(db)
    if err != nil { return err }

    if target == curr { return nil }
    if target > curr {
        // apply up for versions (curr, target]
        for _, m := range migs {
            if m.Version > curr && m.Version <= target {
                if err := execSQLFile(db, m.UpPath); err != nil {
                    return fmt.Errorf("apply up %d failed: %w", m.Version, err)
                }
                if err := recordApplied(db, m.Version); err != nil { return err }
            }
        }
        return nil
    }

    // target < curr: revert down stepwise until target
    // Build a map for quick lookup
    byVersion := map[int]Migration{}
    for _, m := range migs { byVersion[m.Version] = m }
    for v := curr; v > target; v-- {
        m, ok := byVersion[v]
        if !ok { return fmt.Errorf("migration %d not found for down", v) }
        if m.DownPath == "" { return fmt.Errorf("no down migration for version %d", v) }
        if err := execSQLFile(db, m.DownPath); err != nil { return fmt.Errorf("apply down %d failed: %w", v, err) }
        if err := recordReverted(db, v); err != nil { return err }
    }
    return nil
}

func execSQLFile(db *sql.DB, path string) error {
    b, err := os.ReadFile(path)
    if err != nil { return err }
    sqlText := string(b)
    // Split on semicolons to avoid driver limitations with multiple statements
    stmts := splitSQLStatements(sqlText)
    tx, err := db.Begin()
    if err != nil { return err }
    for _, s := range stmts {
        if strings.TrimSpace(s) == "" { continue }
        if _, err := tx.Exec(s); err != nil {
            _ = tx.Rollback()
            return err
        }
    }
    return tx.Commit()
}

func splitSQLStatements(sqlText string) []string {
    // naive split by semicolon; good enough for our simple migrations
    parts := strings.Split(sqlText, ";")
    out := make([]string, 0, len(parts))
    for _, p := range parts {
        out = append(out, p)
    }
    return out
}

func atoi(s string) (int, error) {
    var n int
    for _, ch := range []byte(s) {
        if ch < '0' || ch > '9' { return 0, fmt.Errorf("invalid int: %s", s) }
        n = n*10 + int(ch-'0')
    }
    return n, nil
}

