import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Dashboard from './components/dashboard/dashboard';
import Access from './components/dashboard/access/Access';
import AddAccess from './components/dashboard/access/AddAccess';
import '../src/components/login/Login.css';
import '../src/components/dashboard/timezone/calendar.css';
import AddRole from './components/dashboard/role/AddRole';
import Role from './components/dashboard/role/Role';
import Assignment from './components/dashboard/assignment/Assignment';
import AddAssignment from './components/dashboard/assignment/AddAssignment';
import Signup from './components/login/Signup';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import NoAccess from './components/dashboard/NoAccess'; // Import du composant NoAccess
import axiosInstance from './axiosInstance';
import UpdateUser from './components/dashboard/UpdateProfile';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('isAuthenticated')) || false
  );
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axiosInstance.get('user/profile/');
        setPermissions(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
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

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
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
            element={hasPermission('can_access_home') ? <Access /> : <NoAccess />}
          />
          <Route
            path="access"
            element={hasPermission('can_manage_access') ? <Access /> : <NoAccess />}
          />
          <Route
            path="access/new"
            element={hasPermission('can_manage_access') ? <AddAccess /> : <NoAccess />}
          />
          <Route
            path="roles"
            element={hasPermission('can_manage_role') ? <Role /> : <NoAccess />}
          />
          <Route
            path="roles/new"
            element={hasPermission('can_manage_role') ? <AddRole /> : <NoAccess />}
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

        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard/home" /> : <Navigate to="/login" />} />
        
        {/* Route pour les pages non trouvées ou accès refusé */}
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
    </Router>
  );
};

export default App;
