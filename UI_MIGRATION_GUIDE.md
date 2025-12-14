# UI Migration Guide: Old to New Interface

## 🚨 Deprecation Notice

The old Mindcraft UI (port 8080) is **deprecated** and will be discontinued on **December 31, 2026**. This guide will help you migrate to the new React-based UI (port 5173).

## Quick Start Migration

### Step 1: Update Your Workflow

**Old Workflow:**
```bash
node main.js
# Open http://localhost:8080
```

**New Workflow:**
```bash
# Terminal 1: Start backend
node main.js

# Terminal 2: Start new UI
cd frontend
npm run dev

# Open http://localhost:5173
```

**Combined Workflow:**
```bash
npm run ui:both  # Starts both backend and new UI
```

### Step 2: Update Bookmarks

- ❌ Remove: `http://localhost:8080`
- ✅ Add: `http://localhost:5173`

### Step 3: Verify Migration

1. Backend running on port 8080 (API only)
2. New UI running on port 5173 (interface)
3. Open browser to `http://localhost:5173`
4. Confirm agents appear and functionality works

## Feature Comparison

| Feature | Old UI (8080) | New UI (5173) | Status |
|---------|---------------|---------------|---------|
| Agent Management | Basic list | Enhanced dashboard | ✅ Improved |
| Real-time Updates | Polling-based | WebSocket live | ✅ Enhanced |
| Agent State View | Simple text | Rich visualization | ✅ Enhanced |
| Debug Information | Console logs | Integrated debugger | ✅ Enhanced |
| Mobile Support | None | Responsive design | ✅ New |
| Performance | Standard | Optimized rendering | ✅ Improved |
| Error Handling | Basic alerts | Rich error display | ✅ Improved |
| Developer Tools | Limited | Modern dev tools | ✅ Enhanced |

## New UI Features

### 🎯 Enhanced Agent Dashboard
- Real-time agent state updates
- Interactive agent controls
- Visual status indicators
- Performance metrics

### 📊 Advanced Visualization
- Agent state graphs
- Resource usage charts
- Activity timelines
- Goal progression tracking

### 🛠️ Improved Developer Experience
- Hot reload during development
- Better error messages
- Integrated debugging tools
- Component-based architecture

### 📱 Mobile Responsive
- Works on tablets and phones
- Touch-friendly interface
- Adaptive layouts

## API Compatibility

### ✅ What Stays the Same
- All REST API endpoints (`/api/*`)
- Socket.IO events and data structures
- Agent configuration and profiles
- Backend functionality and behavior

### 🔄 What Changed
- Web interface moved from port 8080 to 5173
- Static file serving deprecated
- Frontend now separate React application

## Development Setup

### Prerequisites
- Node.js 18+ (same as before)
- Additional frontend dependencies (auto-installed)

### Development Commands

```bash
# Start new UI only
npm run ui:new

# Start backend only (deprecated UI)
npm run ui:old

# Start both (recommended)
npm run ui:both

# Check migration status
npm run migration:check
```

### Environment Variables

```bash
# Backend (unchanged)
PORT=8080
HOST=localhost

# Frontend (new)
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

## Troubleshooting

### Common Issues

**Q: Frontend not connecting to backend?**
```bash
# Ensure backend is running first
node main.js

# Then start frontend
cd frontend && npm run dev
```

**Q: Port conflicts?**
```bash
# Check what's using ports
netstat -an | grep :8080
netstat -an | grep :5173

# Kill processes if needed
npx kill-port 8080
npx kill-port 5173
```

**Q: Missing frontend dependencies?**
```bash
cd frontend
npm install
npm run dev
```

**Q: Old UI still opens automatically?**
```bash
# Update settings.js
"auto_open_ui": false,  # Disable auto-open
# Then manually open http://localhost:5173
```

### Error Messages

**"Backend server is not running"**
- Start the backend: `node main.js`
- Verify port 8080 is available

**"Frontend compilation failed"**
- Check Node.js version (18+ recommended)
- Run `cd frontend && npm install`
- Clear cache: `rm -rf node_modules && npm install`

**"WebSocket connection failed"**
- Ensure both backend and frontend are running
- Check firewall settings
- Verify CORS configuration

## Migration Timeline

| Date | Milestone | Action Required |
|------|-----------|-----------------|
| 2025-12-14 | Deprecation Announcement | Begin migration planning |
| 2026-03-01 | Enhanced Warnings | Deprecation notices in UI |
| 2026-06-01 | Active Migration Phase | Regular deprecation alerts |
| 2026-09-01 | Final Warning | Sunset announcement |
| 2026-12-31 | Old UI Sunset | Discontinuation of port 8080 UI |

## Getting Help

### Documentation
- [Main README](README.md) - General setup
- [Frontend README](frontend/README.md) - UI-specific docs
- [API Documentation](PROFILE_API_DOCUMENTATION.md) - Backend API

### Community Support
- [Discord Server](https://discord.gg/mp73p35dzC) - Real-time help
- [GitHub Issues](https://github.com/mindcraft-bots/mindcraft/issues) - Bug reports

### Migration Assistance
If you need help with migration:
1. Check this guide first
2. Search existing GitHub issues
3. Join Discord for live support
4. Create detailed issue if problem persists

## Advanced Configuration

### Custom Ports
```bash
# Backend on custom port
node main.js --port 3001

# Frontend connecting to custom backend
VITE_API_URL=http://localhost:3001 npm run dev
```

### Production Deployment
```bash
# Build frontend for production
cd frontend && npm run build

# Serve with nginx or similar
# Backend API remains on port 8080
# Frontend served from web server
```

### Docker Deployment
```bash
# Updated docker command includes new UI port
docker run -p 8080:8080 -p 5173:5173 mindcraft
```

## Feedback and Contributions

We welcome feedback on the migration process:
- Report issues on GitHub
- Suggest improvements
- Contribute to documentation
- Help others in Discord

---

**Last Updated**: 2025-12-14  
**Next Review**: 2026-03-01  
**Contact**: Discord support or GitHub issues