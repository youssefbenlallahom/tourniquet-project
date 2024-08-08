import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

const Header = ({ username, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication status from localStorage
    localStorage.removeItem('isAuthenticated');
    // Call the onLogout function to update the App state
    onLogout(false);
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <Navbar expand="lg" variant="dark" style={{ background: 'linear-gradient(90deg, #925000, #000428)' }}>
      <Container>
        <Navbar.Brand href="/dashboard">
          <img
            src="/assets/logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Logo"
          />
          Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <NavDropdown title={`Logged in as: ${username}`} id="basic-nav-dropdown" alignRight>
              <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
