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

  // Initialize simplified streaming services on app start
  useEffect(() => {
    const initializeStreamingServices = async () => {
      try {
        console.log('🚀 Starting event-driven streaming services initialization...');
        
        // Step 1: Initialize the socket service first
        console.log('📡 Step 1: Initializing socket service...');
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';
        console.log('📡 Socket URL:', socketUrl);
        console.log('📡 Environment variables:', {
          VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
          VITE_API_URL: import.meta.env.VITE_API_URL,
          MODE: import.meta.env.MODE
        });
        
        const socketService = initializeSocket({
          url: socketUrl,
          options: {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
          },
        });
        
        // Step 2: Connect to the server and wait for successful connection
        console.log('📡 Step 2: Establishing server connection...');
        await dispatch(connectToServer()).unwrap();
        console.log('✅ Server connection established successfully');
        
        // Step 3: Initialize streaming service
        console.log('📊 Step 3: Creating simplified streams...');
        const { streamingService } = await import('./services/streamingService');
        
        // Ensure streams are created before proceeding
        await streamingService.createSimplifiedStreams();
        console.log('✅ Streaming service initialized successfully');
        
        // Step 4: Initialize agents socket system
        console.log('🤖 Step 4: Initializing simplified agent system...');
        await dispatch(initializeAgentsSocket()).unwrap();
        console.log('✅ Agent system initialized successfully');
        
        console.log('🎉 All event-driven streaming services initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize streaming services:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        // Don't let initialization failure crash the app
        // The dashboard will show connection status and allow retry
      }
    };

    // Start initialization immediately without artificial delays
    initializeStreamingServices();
    
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Mindcraft Simplified Dashboard
              </Typography>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {loading && (
              <Loading
                overlay={true}
                message="Initializing simplified dashboard..."
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