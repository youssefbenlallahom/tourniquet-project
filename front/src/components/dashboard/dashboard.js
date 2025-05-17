import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Settings from './Settings';
import Header from './Header';
import Sidebar from './Sidebar';
import Assignment from './assignment/Assignment';
import AddAssignment from './assignment/AddAssignment';
import Home from './Home';
import axiosInstance from '../../axiosInstance';
import { Box } from '@mui/material';

const Dashboard = ({ onLogout }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/profile/');

        if (response.status === 200) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Sidebar - positioned absolutely */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        bottom: 0,
        width: { xs: 0, md: '212px' },
        zIndex: 1200
      }}>
        <Sidebar />
      </Box>
      
      {/* Main content area */}
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginLeft: { xs: 0, md: '212px' },
      }}>
        {/* Header */}
        <Header username={username} onLogout={onLogout} />
        
        {/* Page content */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          backgroundColor: '#f5f7fa'
        }}>
          <Routes>
            <Route path="home" element={<Home />} />
            <Route path="settings" element={<Settings />} />
            <Route path="assignment" element={<Assignment />} />
            <Route path="assignment/new" element={<AddAssignment />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
