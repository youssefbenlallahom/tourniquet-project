import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import Config from './config/Config';
import Settings from './Settings';
import Header from './Header';
import Sidebar from './Sidebar';
import Calendar from './timezone/Calendar';
import Access from './access/Access';
import AddAccess from './access/AddAccess'; 
import Role from './role/Role';
import AddRole from './role/AddRole';
import Assignment from './assignment/Assignment';
import AddAssignment from './assignment/AddAssignment';
import Bracelet from './bracelet/Bracelet';
import axiosInstance from '../../axiosInstance';
const Dashboard = ({ onLogout }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/user/profile/');

        if (response.status === 200) {
          setUsername(response.data.username); // Assuming `username` field is in the response
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <Container fluid>
        <Header username={username} onLogout={onLogout} />
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="config" element={<Config />} />
          <Route path="settings" element={<Settings />} />
          <Route path="access" element={<Access />} />
          <Route path="access/new" element={<AddAccess />} />
          <Route path="roles" element={<Role />} />
          <Route path="roles/new" element={<AddRole />} />
          <Route path="assignment" element={<Assignment />} />
          <Route path="assignment/new" element={<AddAssignment />} />
          <Route path="bracelet" element={<Bracelet />} />
        </Routes>
      </Container>
    </div>
  );
};

export default Dashboard;
