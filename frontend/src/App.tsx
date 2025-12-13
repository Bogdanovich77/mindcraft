import React, { useEffect } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Loading from './components/common/Loading';
import CognitiveDashboard from './components/pages/CognitiveDashboard';
import { useAppSelector, type AppDispatch } from './store';
import { selectGlobalLoading, selectGlobalError } from './store/slices/uiSlice';
import { connectToServer } from './store/slices/connectionSlice';
import { initializeSocket } from './services/socketService';
import { initializePersonalitySocket } from './store/slices/personalitySlice';
import { initializeMemorySocket } from './store/slices/memorySlice';
import { initializeGoalsSocket } from './store/slices/goalsSlice';
import { initializeSocialSocket } from './store/slices/socialSlice';
import { initializeSkillsSocket } from './store/slices/skillsSlice';
import { initializePerformanceSocket } from './store/slices/performanceSlice';
import { initializeAgentsSocket } from './store/slices/agentsSlice';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#091a2a',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff6e40',
      dark: '#9a0036',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useAppSelector(selectGlobalLoading);
  const error = useAppSelector(selectGlobalError);

  // Initialize all streaming services on app start
  useEffect(() => {
    const initializeStreamingServices = async () => {
      try {
        console.log('🚀 Starting streaming services initialization...');
        
        // Initialize the socket service first with default config
        const socketService = initializeSocket({
          url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080',
          options: {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
          },
        });
        
        // Connect to the server first
        console.log('📡 Connecting to server...');
        await dispatch(connectToServer()).unwrap();
        
        // Initialize streaming service once and create all cognitive streams
        console.log('📊 Creating cognitive streams...');
        const { streamingService } = await import('./services/streamingService');
        
        // Ensure streams are created before proceeding
        await streamingService.createCognitiveStreams();
        
        // Wait a brief moment for streams to be fully registered
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Then initialize all cognitive component sockets in sequence
        console.log('🧠 Initializing cognitive components...');
        const initPromises = [
          dispatch(initializePersonalitySocket()).unwrap(),
          dispatch(initializeMemorySocket()).unwrap(),
          dispatch(initializeGoalsSocket()).unwrap(),
          dispatch(initializeSocialSocket()).unwrap(),
          dispatch(initializeSkillsSocket()).unwrap(),
          dispatch(initializePerformanceSocket('default')).unwrap(),
          dispatch(initializeAgentsSocket()).unwrap(),
        ];
        
        // Wait for all to complete with error handling
        const results = await Promise.allSettled(initPromises);
        
        // Check for any failed initializations
        const failed = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
        if (failed.length > 0) {
          console.warn('⚠️ Some cognitive components failed to initialize:', failed.map(f => f.reason));
        } else {
          console.log('✅ All cognitive components initialized successfully');
        }
        
        console.log('🎉 All streaming services initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize streaming services:', error);
        // Don't let initialization failure crash the app
        // The dashboard will show connection status and allow retry
      }
    };

    // Add a small delay to ensure React is fully mounted
    const timer = setTimeout(initializeStreamingServices, 100);
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Mindcraft Cognitive Dashboard
              </Typography>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {loading && (
              <Loading
                overlay={true}
                message="Initializing dashboard..."
                size={60}
              />
            )}

            {error && (
              <Box
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: 'error.dark',
                  color: 'error.contrastText',
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Application Error
                </Typography>
                <Typography variant="body1">
                  {error}
                </Typography>
              </Box>
            )}

            {!loading && !error && (
              <Container maxWidth="xl">
                <CognitiveDashboard />
              </Container>
            )}
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default AppContent;
