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
        // Initialize the socket service first with default config
        initializeSocket({
          url: 'http://localhost:8080',
          options: {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
          },
        });
        
        // Then connect to the server
        await dispatch(connectToServer()).unwrap();
        
        // Initialize all cognitive component streaming
        await Promise.all([
          dispatch(initializePersonalitySocket()).unwrap(),
          dispatch(initializeMemorySocket()).unwrap(),
          dispatch(initializeGoalsSocket()).unwrap(),
          dispatch(initializeSocialSocket()).unwrap(),
          dispatch(initializeSkillsSocket()).unwrap(),
          dispatch(initializePerformanceSocket()).unwrap()
        ]);
        
        console.log('✅ All streaming services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize streaming services:', error);
      }
    };

    initializeStreamingServices();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
