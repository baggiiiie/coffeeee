package main

import (
    "flag"
    "fmt"
    "log"
    "os"
    "strconv"

    "coffeeee/backend/internal/config"
    "coffeeee/backend/internal/database"
    mig "coffeeee/backend/internal/migrate"
)

func usage() {
    fmt.Println("Usage: migrate <command> [args]")
    fmt.Println("Commands:")
    fmt.Println("  up                 Apply all pending migrations")
    fmt.Println("  down               Revert the latest migration")
    fmt.Println("  to <version>       Migrate to a specific version")
}

func main() {
    flag.Usage = usage
    flag.Parse()
    args := flag.Args()
    if len(args) == 0 {
        usage()
        os.Exit(1)
    }

    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("failed to load config: %v", err)
    }

    db, err := database.Init(cfg.Database.URL)
    if err != nil {
        log.Fatalf("failed to init database: %v", err)
    }
    defer db.Close()

    migrationsDir := cfg.Database.MigrationsPath

    switch args[0] {
    case "up":
        if err := mig.ApplyUpToLatest(db, migrationsDir); err != nil {
            log.Fatalf("migrate up failed: %v", err)
        }
        fmt.Println("Migrations applied to latest.")
    case "down":
        if err := mig.ApplyDownOne(db, migrationsDir); err != nil {
            log.Fatalf("migrate down failed: %v", err)
        }
        fmt.Println("Reverted latest migration.")
    case "to":
        if len(args) < 2 {
            log.Fatal("missing target version for 'to'")
        }
        v, err := strconv.Atoi(args[1])
        if err != nil { log.Fatalf("invalid version: %v", err) }
        if err := mig.ApplyToVersion(db, migrationsDir, v); err != nil {
            log.Fatalf("migrate to %d failed: %v", v, err)
        }
        fmt.Printf("Migrated to version %d.\n", v)
    default:
        usage()
        os.Exit(1)
    }
}

