import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaCog, FaSlidersH, FaKey, FaUsers, FaTasks, FaLink } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar bg-dark text-white" style={{ width: '250px', height: '100vh' }}>
      <div className="sidebar-brand p-3 text-center">
        <img
          src="/assets/logo.png"
          width="70"
          height="70"
          className="d-inline-block align-top"
          alt="Logo"
        />
        <h4 className="mt-2">Dashboard</h4>
      </div>
      <Nav className="flex-column p-3">
        <Nav.Link as={Link} to="home" className="text-white">
          <FaHome className="me-2" /> Home
        </Nav.Link>
        <Nav.Link as={Link} to="config" className="text-white">
          <FaCog className="me-2" /> Devices Config
        </Nav.Link>
        <Nav.Link as={Link} to="access" className="text-white">
          <FaKey className="me-2" /> Access/Config
        </Nav.Link>
        <Nav.Link as={Link} to="role" className="text-white">
          <FaUsers className="me-2" /> Config User/Role
        </Nav.Link>
        <Nav.Link as={Link} to="calendar" className="text-white">
          <FaCalendarAlt className="me-2" /> TimeZone/Config
        </Nav.Link>
        <Nav.Link as={Link} to="assignment" className="text-white">
          <FaTasks className="me-2" /> Assignments
        </Nav.Link>
        <Nav.Link as={Link} to="bracelet" className="text-white">  {/* Add Bracelet Link */}
          <FaLink className="me-2" /> Bracelet Management
        </Nav.Link>
        <Nav.Link as={Link} to="settings" className="text-white">
          <FaSlidersH className="me-2" /> Settings
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
