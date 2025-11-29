# Internal Developer Platform (IDP)

A modern, self-service Internal Developer Platform inspired by Port.io, built with React, TypeScript, and Vite.

## Features

### 🗂️ Software Catalog
- Centralized catalog of all services, APIs, libraries, and resources
- Entity relationships and dependency visualization
- Real-time status monitoring
- Advanced filtering and search

### 🚀 Self-Service Portal
- One-click deployments
- Environment provisioning
- Infrastructure resource requests
- Database creation and management
- Automated workflows with approval flows

### 🌍 Environment Management
- Multi-environment support (dev, staging, production)
- Environment health monitoring
- Quick provisioning and scaling

### ⚡ Actions & Workflows
- Automated CI/CD pipelines
- Custom workflow definitions
- Integration with Git, Kubernetes, and cloud providers

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idpnext
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Sidebar, MainLayout)
│   ├── catalog/         # Software catalog components
│   ├── self-service/    # Self-service portal components
│   └── common/          # Shared components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript type definitions
├── store/               # Zustand stores
└── utils/               # Utility functions
```

## API Integration

The frontend is configured to proxy API requests to `http://localhost:8080`. Update the proxy configuration in [vite.config.ts](vite.config.ts:11-16) to match your backend URL.

## Features Roadmap

### Phase 1 ✅
- Software Catalog
- Basic API structure
- Self-Service Portal UI

### Phase 2 (In Progress)
- RBAC & Authentication
- Real API integrations
- CI/CD workflow triggers

### Phase 3 (Planned)
- Observability dashboards
- Infrastructure as Code provisioning
- Advanced environment management

### Phase 4 (Future)
- Governance & compliance
- Plugin ecosystem
- Multi-cloud support

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT
