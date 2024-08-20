import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Drawer } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaCog, FaSlidersH, FaKey, FaUsers, FaTasks, FaLink } from 'react-icons/fa';
import { styled } from '@mui/material/styles';

// Define drawer width
const drawerWidth = 250;

// Styled Drawer
const CustomDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#000000', // Black background
    color: '#f5f5f5', // Light gray text color
    overflow: 'hidden', // Hide overflow
    overflowY: 'auto', // Ensure vertical overflow is scrollable only
  },
}));

// Styled ListItem
const CustomListItem = styled(ListItem)(({ theme, selected }) => ({
  transition: theme.transitions.create(['background-color', 'transform'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: selected ? '#9c1e24' : 'transparent', // More intense red for selected
  color: '#f5f5f5', // Light gray text color for both states
  borderRadius: '8px', // Rounded corners
  '&:hover': {
    backgroundColor: selected ? '#c62828' : '#ab1e24', // Intense red for hover
    color: '#f5f5f5',
    transform: 'scale(1.05)', // Slight scale effect on hover
  },
  '&.Mui-selected': {
    backgroundColor: '#9c1e24', // Intense red for selected
    color: '#f5f5f5',
    transform: 'scale(1.02)', // Slightly scaled effect for selected item
  },
}));

const Sidebar = () => {
  const location = useLocation();

  // Define menu items with text, icon, and path
  const menuItems = [
    { text: 'Home', icon: <FaHome />, path: '/dashboard/home' },
    { text: 'Devices Config', icon: <FaCog />, path: '/dashboard/config' },
    { text: 'Access/Config', icon: <FaKey />, path: '/dashboard/access' },
    { text: 'Config User/Role', icon: <FaUsers />, path: '/dashboard/role' },
    { text: 'TimeZone/Config', icon: <FaCalendarAlt />, path: '/dashboard/calendar' },
    { text: 'Assignments', icon: <FaTasks />, path: '/dashboard/assignment' },
    { text: 'Bracelet Management', icon: <FaLink />, path: '/dashboard/bracelet' },
    { text: 'Settings', icon: <FaSlidersH />, path: '/dashboard/settings' },
  ];

  return (
    <CustomDrawer variant="permanent" anchor="left">
      <Box>
        <Box sx={{ padding: 2, textAlign: 'center', borderBottom: '1px solid #333' }}>
          <img
            src="/assets/logo.png"
            width="100" // Adjusted logo size
            height="100"
            alt="Logo"
            style={{ 
              marginBottom: 10, 
              borderRadius: '50%', // Circular logo
              border: '5px solid #f5f5f5', // Light gray border for contrast
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' // Shadow for depth
            }}
          />
        </Box>
        <Divider sx={{ borderColor: '#333' }} />
        <List>
          {menuItems.map((item) => (
            <CustomListItem
              button
              component={Link}
              to={item.path}
              key={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </CustomListItem>
          ))}
        </List>
      </Box>
    </CustomDrawer>
  );
};

export default Sidebar;
