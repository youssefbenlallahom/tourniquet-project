import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import Home from './Home';
import Config from './config/Config';
import Settings from './Settings';
import Header from './Header';
import Sidebar from './Sidebar';
import Calendar from './timezone/Calendar';
import Access from './access/Access';
import AddAccess from './access/AddAccess'; // Import AddAccess
import Role from './role/Role';
import AddRole from './role/AddRole'; // Import AddRole
import Assignment from './assignment/Assignment';
import AddAssignment from './assignment/AddAssignment';
import Bracelet from './bracelet/Bracelet';

const Dashboard = ({ onLogout }) => {
  const username = 'youssef';

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
          <Route path="assignment/new" element={<AddAssignment />} /> {/* Add this route */}
          <Route path="bracelet" element={<Bracelet />} />
        </Routes>
      </Container>
    </div>
  );
};

export default Dashboard;