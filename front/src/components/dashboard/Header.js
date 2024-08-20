import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

// Define a custom styled Navbar
const CustomNavbar = styled(Navbar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #000000, #AB1E24)', // Black to dark red gradient
  borderBottom: '2px solid #AB1E24', // Red border for consistency
  width: 'calc(100% - 250px)', // Adjust width to fit the viewport minus the sidebar width
  marginLeft: '250px', // Align with the Sidebar
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
  position: 'fixed', // Fixed position at the top
  top: 0,
  left: 0,
  zIndex: 1030, // Ensure it's above other content
  height: '60px', // Set a specific height for the header
  '& .navbar-nav .nav-link': {
    color: '#f5f5f5 !important', // Light gray text color
    '&:hover': {
      color: '#000000 !important', // Red color on hover
    },
  },
  '& .navbar-toggler': {
    borderColor: '#AB1E24', // Toggler border color
  },
  '& .navbar-toggler-icon': {
    backgroundImage: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22%3E%3Cpath stroke=%22%23AB1E24%22 stroke-width=%222%22 d=%22M0 7h30M0 15h30M0 23h30%22/%3E%3C/svg%3E")', // Toggler icon color
  },
}));

const CustomNavDropdown = styled(NavDropdown)(({ theme }) => ({
  '& .dropdown-menu': {
    backgroundColor: '#1c1c1c', // Dark background for dropdown menu
    color: '#f5f5f5', // Light gray text color
    border: 'none', // Remove border
    borderRadius: '8px', // Rounded corners
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)', // Shadow for dropdown
    transition: 'all 0.3s ease', // Smooth transition
    maxWidth: '300px', // Maximum width to prevent overflow
    right: 0, // Align to the right edge of the parent
    left: 'auto', // Override left alignment
    overflow: 'hidden', // Prevent content overflow
    zIndex: 1040, // Ensure it appears above other content
  },
  '& .dropdown-item': {
    color: '#f5f5f5', // Light gray text color
    '&:hover': {
      backgroundColor: '#AB1E24', // Red highlight on hover
      color: '#ffffff', // White text on hover
    },
  },
}));

const Header = ({ username, onLogout = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault(); // Prevent default behavior
    console.log('onLogout:', onLogout); // Debugging: Check if onLogout is a function
    if (typeof onLogout === 'function') {
      localStorage.removeItem('isAuthenticated');
      onLogout(false);
      navigate('/login');
    } else {
      console.error('onLogout is not a function');
    }
  };

  return (
    <CustomNavbar expand="lg" variant="dark">
      <Container fluid>
        <Navbar.Brand href="/dashboard">
          {/* Removed the logo and text */}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <CustomNavDropdown
              title={<><FaUserCircle size={24} /> {username}</>}
              id="profile-nav-dropdown"
              alignRight
            >
              <NavDropdown.Item href="#profile">
                <FaUserCircle size={18} className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt size={18} className="me-2" />
                Logout
              </NavDropdown.Item>
            </CustomNavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </CustomNavbar>
  );
};


export default Header;
