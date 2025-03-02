import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import theme from './theme/theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

// We need to access context inside a provider
const AppContent = () => {
  const { resetAll } = useAppContext();
  return (
    <Router>
      <Navbar onResetData={resetAll} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;