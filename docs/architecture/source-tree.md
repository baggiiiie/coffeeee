# Source Tree

## Monorepo Organization

```
coffee-companion/
├── package.json (workspace root)
├── go.mod (Go module root)
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── apps/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── context/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── public/
│   │   └── dist/
│   │
│   └── backend/
│       ├── go.mod
│       ├── go.sum
│       ├── main.go
│       ├── cmd/
│       ├── internal/
│       ├── pkg/
│       ├── configs/
│       ├── migrations/
│       └── docs/
│
├── packages/
│   ├── shared-types/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── coffee.ts
│   │   │   └── brewlog.ts
│   │   └── dist/
│   │
│   └── ui-components/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── Button/
│       │   ├── Card/
│       │   ├── Form/
│       │   └── Layout/
│       └── dist/
│
├── docs/
│   ├── architecture.md
│   ├── prd.md
│   ├── brief.md
│   └── api/
│
├── scripts/
│   ├── setup.sh
│   ├── build.sh
│   ├── test.sh
│   └── deploy.sh
│
└── tools/
    ├── lint-staged.config.js
    ├── .eslintrc.js
    ├── .prettierrc
    └── commitlint.config.js
```

## Workspace Configuration

**Root package.json:**

```json
{
  "name": "coffee-companion",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "npm test '--workspace=apps/frontend' -- --run --silent",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "clean": "npm run clean --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

## Shared Package Structure

**shared-types package:**

- TypeScript interfaces shared between frontend and backend
- API request/response types
- Database model types
- Validation schemas

**ui-components package:**

- Reusable React components
- Design system components
- Form components
- Layout components

## Development Environment Setup

**Prerequisites:**

- Node.js 18+
- Go 1.22+
- SQLite 3.x
- Git

**Setup Commands:**

```bash

