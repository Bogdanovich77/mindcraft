# Mindcraft Cognitive Dashboard - Frontend

A modern React TypeScript application for visualizing and managing Mindcraft LangGraph agents with advanced cognitive capabilities.

## 🚀 Features

### Core Architecture
- **React 19** with TypeScript for type safety
- **Redux Toolkit** for state management with typed hooks
- **Material-UI (MUI)** for modern, responsive UI components
- **Socket.IO Client** for real-time agent communication
- **Vite** for fast development and optimized builds

### Cognitive Dashboard Components
- **Agent Overview**: Real-time agent status and health monitoring
- **Personality Visualization**: Big Five traits and gaming-specific characteristics
- **Memory Systems**: Semantic, episodic, procedural, and working memory visualization
- **Goal Management**: Hierarchical goal tracking (strategic, tactical, operational)
- **Skill Progression**: Dynamic skill development with experience tracking
- **Social Relationships**: Trust levels, friendship scores, and reputation tracking
- **Performance Metrics**: Response times, success rates, and system health

### Technical Stack
- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router DOM v7
- **Charts**: Recharts, D3.js for advanced visualizations
- **Real-time**: Socket.IO client for backend integration
- **Build Tools**: Vite, ESLint, TypeScript compiler

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/       # Button, Loading, ErrorBoundary
│   │   ├── agent/        # Agent-specific components
│   │   ├── cognitive/    # Cognitive visualization components
│   │   ├── layout/       # Layout and navigation
│   ├── pages/              # Main application pages
│   │   └── AgentList.tsx    # Agent dashboard
│   ├── store/              # Redux store configuration
│   │   ├── slices/          # Redux slices
│   │   └── types.ts         # Store type definitions
│   ├── services/           # External service integrations
│   │   └── socketService.ts   # Socket.IO client
│   ├── types/              # TypeScript type definitions
│   │   └── agent.ts          # Agent state types
│   ├── utils/               # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── charts/              # Chart components
│   ├── visualizers/         # Data visualization
│   ├── forms/               # Form components
│   └── modals/              # Modal dialogs
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # This file
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Environment Configuration
The application supports different environments through environment variables:

- `VITE_API_URL` - Backend API endpoint (default: http://localhost:3000)
- `VITE_SOCKET_URL` - Socket.IO server URL (default: http://localhost:3000)
- `VITE_APP_TITLE` - Application title (default: Mindcraft Dashboard)

### Development Features

#### Hot Module Replacement (HMR)
- Fast development with instant updates
- Component state preservation during hot reloads

#### TypeScript Integration
- Strict type checking enabled
- Path mapping configured for clean imports
- Type definitions for all API responses

#### Redux DevTools
- Time-travel debugging for state changes
- Action logging and inspection

## 🔌 Backend Integration

### Socket.IO Events
The frontend listens for real-time updates from the Mindcraft backend:

```typescript
// Agent lifecycle events
'agent_list'        // Initial agent list
'agent_update'       // Real-time agent state changes
'system_status'     // System health and status
'connection_status'  // Connection state changes

// Agent interaction events
'subscribe_agent'    // Subscribe to specific agent updates
'unsubscribe_agent'  // Unsubscribe from agent updates
```

### API Integration
RESTful API endpoints for agent management:
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get specific agent details
- `POST /api/agents/:id/command` - Send commands to agents
- `GET /api/system/status` - Get system status

## 🎨 UI Components

### Material-UI Theme
- Dark mode support with customizable color palette
- Responsive design for mobile and desktop
- Accessible components following WCAG guidelines

### Agent Cards
- Real-time health and status indicators
- Interactive agent selection and details
- Performance metrics visualization
- Quick action buttons for common operations

### Data Visualizations
- **D3.js**: Network graphs, relationship maps
- **Recharts**: Performance trends, skill progression
- **Custom**: Personality radar charts, memory heatmaps

## 📊 State Management

### Redux Store Structure
```typescript
interface RootState {
  agents: AgentsState;      // Agent data and selection
  ui: UIState;             // UI state and navigation
  connection: ConnectionState;  // Socket.IO connection
}
```

### Slices
- `agentsSlice` - Agent data management
- `uiSlice` - UI state and navigation
- `connectionSlice` - Real-time connection management

### Typed Hooks
- `useAppSelector` - Type-safe state selection
- `useAppDispatch` - Type-safe action dispatching

## 🔧 Configuration

### TypeScript Configuration
- Strict mode enabled for better type safety
- Path mapping for clean imports
- JSX support configured

### Vite Configuration
- Development server on port 5173
- Proxy configuration for API calls
- Build optimization for production

### ESLint Configuration
- React recommended rules
- TypeScript specific rules
- Import/export organization

## 🚀 Production Deployment

### Build Optimization
- Code splitting with lazy loading
- Tree shaking for unused code elimination
- Asset optimization and compression
- Source map generation for debugging

### Environment Variables
```bash
# Production
VITE_API_URL=https://api.mindcraft.example.com
VITE_SOCKET_URL=https://socket.mindcraft.example.com

# Development
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🧪 Testing

### Unit Testing
- Jest configuration for component testing
- React Testing Library for UI components
- Mock service implementations for isolated testing

### Integration Testing
- Socket.IO connection testing
- Redux store integration testing
- End-to-end user workflow testing

## 📈 Performance

### Optimization Features
- React.memo for component memoization
- useMemo and useCallback for expensive operations
- Virtual scrolling for large agent lists
- Lazy loading for code splitting

### Monitoring
- Performance metrics collection
- Error tracking and reporting
- User interaction analytics

## 🔒 Security

### Authentication
- JWT token management
- Secure Socket.IO connections
- XSS prevention in dynamic content

### Data Validation
- Input sanitization
- Type checking at compile time
- Runtime validation for API responses

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Create feature branch from `main`
5. Make changes with proper TypeScript types
6. Test thoroughly before submitting PR

### Code Style
- Follow existing TypeScript and ESLint configurations
- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Maintain consistent formatting

### Pull Request Process
- Ensure all tests pass
- Update documentation for new features
- Request code review from team members
- Follow semantic versioning for releases

## 📝 License

This project is part of the Mindcraft LangGraph system and follows the same licensing terms as the main project.

## 🔗 Related Documentation

- [Mindcraft LangGraph Architecture](../docs/langgraph_architecture_summary.md)
- [Frontend Design Document](../FRONTEND_REVAMP_DESIGN_DOCUMENT.md)
- [Agent Type Definitions](./src/types/agent.ts)
- [Socket.IO Service](./src/services/socketService.ts)

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the project repository
- Join our Discord community for real-time discussions
- Check existing documentation before asking questions
