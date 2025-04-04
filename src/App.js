import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/common/Navigation';
import Login from './pages/Login';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (location.pathname === '/' && user) {
    return <Navigate to="/students" />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user && <Navigation />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/students" /> : <Login />} />
        <Route
          path="/students"
          element={user ? <Students /> : <Navigate to="/" />}
        />
        <Route
          path="/payments"
          element={user ? <Payments /> : <Navigate to="/" />}
        />
        <Route
          path="/products"
          element={user ? <Products /> : <Navigate to="/" />}
        />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/sales" element={user ? <Sales /> : <Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
