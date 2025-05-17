import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Dashboard from './components/dashboard/dashboard';
import '../src/components/login/Login.css';
import Assignment from './components/dashboard/assignment/Assignment';
import AddAssignment from './components/dashboard/assignment/AddAssignment';
import Signup from './components/login/Signup';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import NoAccess from './components/dashboard/NoAccess';
import axiosInstance from './axiosInstance';
import UpdateUser from './components/dashboard/UpdateProfile';
import Home from './components/dashboard/Home';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Check if token is expired
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // If token expiration time is in the past
        if (decoded.exp < Date.now() / 1000) {
          const refresh = localStorage.getItem('refresh');
          if (!refresh) {
            handleLogout();
            setTokenExpired(true);
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (!checkTokenExpiration()) {
          setLoading(false);
          return;
        }
        
        const response = await axiosInstance.get('/user/profile/');
        setPermissions(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // If there's a 401, the token might be expired and refresh failed
        if (error.response && error.response.status === 401) {
          handleLogout();
          setTokenExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPermissions();
    } else {
      setLoading(false);
    }

    // Add an event listener to check token expiration on window focus
    const handleWindowFocus = () => {
      if (isAuthenticated) {
        checkTokenExpiration();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAuthenticated]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    setTokenExpired(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.setItem('isAuthenticated', JSON.stringify(false));
  };

  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #B30000 0%, #740000 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
        >
          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            style={{ width: '150px', height: 'auto', marginBottom: '16px' }} 
          />
          <Typography variant="h4" color="white" textAlign="center" fontWeight="bold" gutterBottom>
            Game Production
          </Typography>
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <Typography variant="body1" color="white" textAlign="center">
            Loading...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  // Token Expired Message
  if (tokenExpired) {
    return (
      <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            width: '100%',
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="/assets/logo.png" 
              alt="Logo" 
              style={{ width: '100px', height: 'auto', marginBottom: '16px' }} 
            />
            <Typography variant="h5" color="error" gutterBottom>
              Session Expired
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your session has expired. Please log in again to continue.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ExitToApp />}
              onClick={() => {
                setTokenExpired(false);
                window.location.href = '/login';
              }}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </motion.div>
        </Paper>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard/home" /> : <Login onLogin={handleLogin} />}
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/dashboard/*"
              element={isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )}
            >
              <Route
                path="home"
                element={hasPermission('can_access_home') ? <Home /> : <NoAccess />}
              />
              <Route
                path="assignment"
                element={hasPermission('can_manage_assignment') ? <Assignment /> : <NoAccess />}
              />
              <Route
                path="assignment/new"
                element={hasPermission('can_manage_assignment') ? <AddAssignment /> : <NoAccess />}
              />
            </Route>

            {/* Default routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NoAccess />} />
            
            <Route
              path="/dashboard/user/update/:userId"
              element={
                isAuthenticated ? (
                  <UpdateUser />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </AnimatePresence>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
