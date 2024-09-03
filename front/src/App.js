import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Dashboard from './components/dashboard/dashboard';
import Access from './components/dashboard/access/Access';
import AddAccess from './components/dashboard/access/AddAccess';
import '../src/components/login/Login.css';
import '../src/components/dashboard/calendar.css';
import AddRole from './components/dashboard/role/AddRole';
import Role from './components/dashboard/role/Role';
import Assignment from './components/dashboard/assignment/Assignment';
import AddAssignment from './components/dashboard/assignment/AddAssignment';
import Signup from './components/login/Signup';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.setItem('isAuthenticated', JSON.stringify(false));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard/access" /> : <Login onLogin={handleLogin} />}
        />

<Route path="/signup" element={<Signup />} /> {/* Corrected route */}
    
        <Route
          path="/dashboard/*"
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="access" element={<Access />} />
          <Route path="access/new" element={<AddAccess />} />
          <Route path="roles" element={<Role />} />
          <Route path="roles/new" element={<AddRole />} />
          <Route path="assignment" element={<Assignment />} />
          <Route path="assignment/new" element={<AddAssignment />} />
          
          {/* Other dashboard routes */}
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;