import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

const CustomNavbar = styled(Navbar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #000000, #AB1E24)',
  borderBottom: '2px solid #AB1E24',
  width: 'calc(100% - 250px)',
  marginLeft: '250px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1030,
  height: '60px',
  '& .navbar-nav .nav-link': {
    color: '#f5f5f5 !important',
    '&:hover': {
      color: '#000000 !important',
    },
  },
  '& .navbar-toggler': {
    borderColor: '#AB1E24',
  },
  '& .navbar-toggler-icon': {
    backgroundImage: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22%3E%3Cpath stroke=%22%23AB1E24%22 stroke-width=%222%22 d=%22M0 7h30M0 15h30M0 23h30%22/%3E%3C/svg%3E")',
  },
}));

const CustomNavDropdown = styled(NavDropdown)(({ theme }) => ({
  '& .dropdown-menu': {
    backgroundColor: '#1c1c1c',
    color: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    maxWidth: '300px',
    right: 0,
    left: 'auto',
    overflow: 'hidden',
    zIndex: 1040,
  },
  '& .dropdown-item': {
    color: '#f5f5f5',
    '&:hover': {
      backgroundColor: '#AB1E24',
      color: '#ffffff',
    },
  },
}));

const Header = ({ username, onLogout }) => {
  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      console.error('onLogout is not a function');
    }
  };

  return (
    <CustomNavbar expand="lg" variant="dark">
      <Container fluid>
        {/* Content */}
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