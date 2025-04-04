import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/common/Navigation';
import Login from './pages/Login';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard'; 
import Sales from './pages/Sales'; 
import { useSelector } from 'react-redux';

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

  // Si el usuario no está autenticado y no está en la página de login, redirigir a login
  if (!user && location.pathname !== '/login' && location.pathname !== '/') {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado y está en la página de login, redirigir a students
  if (user && (location.pathname === '/login' || location.pathname === '/')) {
    return <Navigate to="/students" replace />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Router>
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
        </ThemeProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </LocalizationProvider>
  );
}

export default App;
