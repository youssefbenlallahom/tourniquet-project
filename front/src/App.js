// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Dashboard from './components/dashboard/dashboard';
import '../src/components/login/Login.css';
import '../src/components/dashboard/calendar.css';



const App = () => {
  // Retrieve the authentication status from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );

  // Update localStorage whenever authentication status changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Function to handle login status change
  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to /dashboard/home if already authenticated */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard/home" /> : <Login onLogin={handleLogin} />}
        />
        {/* Dashboard route with nested routes */}
        <Route
          path="/dashboard/*"
          element={isAuthenticated ? <Dashboard onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />}
        />
        {/* Redirect to /login by default */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
