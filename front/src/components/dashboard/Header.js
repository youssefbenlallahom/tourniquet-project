import React from 'react';
import { Box, Menu, MenuItem, Tooltip, Typography, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExitToApp, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0B1929, #B30000)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  zIndex: 1100,
  height: '60px',
  display: 'flex',
  justifyContent: 'center'
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  padding: '0 16px',
  minHeight: '60px'
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});

const ProfileIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: '#B30000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid white',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  marginLeft: '8px'
}));

const Header = ({ username, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      console.error('onLogout is not a function');
    }
  };

  return (
    <CustomAppBar elevation={0}>
      <StyledToolbar>
        <Box sx={{ flexGrow: 1 }}>
          {/* Title or other elements could go here */}
        </Box>
        
        <Tooltip title="Account settings">
          <UserInfo onClick={handleMenu}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: 'white' }}>
                {username?.toUpperCase()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                ADMINISTRATOR
              </Typography>
            </Box>
            <ProfileIcon>
              <Person sx={{ fontSize: 22, color: 'white' }} />
            </ProfileIcon>
          </UserInfo>
        </Tooltip>
        
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              backgroundColor: '#1A2A42',
              color: 'white',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              '& .MuiMenuItem-root': {
                '&:hover': {
                  backgroundColor: 'rgba(179, 0, 0, 0.1)',
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>
            <ExitToApp sx={{ mr: 1, color: '#B30000' }} /> Logout
          </MenuItem>
        </Menu>
      </StyledToolbar>
    </CustomAppBar>
  );
};

export default Header;