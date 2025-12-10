import React from 'react';
import { Provider } from 'react-redux';
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
import Loading from './components/common/Loading';
import AgentList from './pages/AgentList';
import store from './store';
import { useAppSelector } from './store';
import { selectGlobalLoading, selectGlobalError } from './store/slices/uiSlice';

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

const App: React.FC = () => {
  const loading = useAppSelector(selectGlobalLoading);
  const error = useAppSelector(selectGlobalError);

  return (
    <Provider store={store}>
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
                  <AgentList />
                </Container>
              )}
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
