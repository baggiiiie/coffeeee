# The Coffee Companion

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/baggiiiie/coffeeee)
A fullstack web application for coffee enthusiasts to track their brewing journey, log coffee experiences, and get AI-powered brewing recommendations.

## 🚀 Features

- **Coffee Logging**: Track coffees you've tried with photos and details
- **Brew Logs**: Record brewing parameters and tasting notes
- **AI Integration**: Get brewing suggestions and taste descriptions
- **Brewing Guides**: Step-by-step pour-over tutorials
- **User Profiles**: Personal coffee journey tracking

## 🏗️ Architecture

- **Backend**: Go with SQLite database
- **Frontend**: React with TypeScript and Material-UI
- **AI Services**: OpenAI and Google Gemini integration
- **Deployment**: Single Go binary serving both API and static assets

## 📋 Prerequisites

- Node.js 18+
- Go 1.22+
- SQLite 3.x
- Git

## 🛠️ Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd coffee-companion
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Initialize database and run migrations
```bash
# One-off legacy setup (optional)
make db-setup

# Apply migrations to latest
make db-migrate-up

# Roll back the latest migration (if needed)
make db-migrate-down
```

### 5. Start development servers
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:8080
- Frontend development server on http://localhost:3000

## 📁 Project Structure

```
coffee-companion/
├── apps/
│   ├── frontend/          # React application
│   └── backend/           # Go application
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   └── ui-components/     # Reusable UI components
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── tools/                 # Development tools configuration
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t coffee-companion .
docker run -p 8080:8080 coffee-companion
```

## 📚 Documentation

- [Architecture Document](docs/architecture.md)
- [Product Requirements](docs/prd.md)
- [Project Brief](docs/brief.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

**Happy Brewing! ☕**
