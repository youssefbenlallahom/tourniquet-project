import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Drawer } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaCog, FaKey, FaUsers, FaTasks, FaLink, FaSlidersH, FaLock } from 'react-icons/fa';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosInstance';

const drawerWidth = 250;

const CustomDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#000000',
    color: '#f5f5f5',
    overflow: 'hidden',
    overflowY: 'auto',
  },
}));

const CustomListItem = styled(ListItem)(({ theme, selected, disabled }) => ({
  transition: theme.transitions.create(['background-color', 'transform'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: selected ? '#9c1e24' : 'transparent',
  color: disabled ? '#888' : '#f5f5f5',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: disabled ? 'transparent' : selected ? '#c62828' : '#ab1e24',
    color: '#f5f5f5',
    transform: disabled ? 'none' : 'scale(1.05)',
  },
  '&.Mui-selected': {
    backgroundColor: disabled ? 'transparent' : '#9c1e24',
    transform: 'scale(1.02)',
  },
}));

const Sidebar = () => {
  const location = useLocation();
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the user's permissions from the API
    const fetchPermissions = async () => {
      try {
        const response = await axiosInstance.get('user/profile/');
        setPermissions(response.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setError('Failed to load permissions.');
      } finally {
      }
    };

    fetchPermissions();
  }, []);

  const menuItems = [
    { text: 'Home', icon: <FaHome />, path: '/dashboard/home', permission: true },
    { text: 'Devices Config', icon: <FaCog />, path: '/dashboard/config', permission: permissions.can_manage_device },
    { text: 'Access/Config', icon: <FaKey />, path: '/dashboard/access', permission: permissions.can_manage_access },
    { text: 'Config User/Role', icon: <FaUsers />, path: '/dashboard/roles', permission: permissions.can_manage_role },
    { text: 'TimeZone/Config', icon: <FaCalendarAlt />, path: '/dashboard/calendar', permission: permissions.can_manage_timezone },
    { text: 'Assignments', icon: <FaTasks />, path: '/dashboard/assignment', permission: permissions.can_manage_assignment },
    { text: 'Bracelet Management', icon: <FaLink />, path: '/dashboard/bracelet', permission: permissions.can_manage_bracelet },
    { text: 'Settings', icon: <FaSlidersH />, path: '/dashboard/settings', permission: permissions.can_manage_settings },
  ];

  if (error) return <div>{error}</div>;

  return (
    <CustomDrawer variant="permanent" anchor="left">
      <Box>
        <Box sx={{ padding: 2, textAlign: 'center', borderBottom: '1px solid #333' }}>
          <img
            src="/assets/logo.png"
            width="100"
            height="100"
            alt="Logo"
            style={{
              marginBottom: 10,
              borderRadius: '50%',
              border: '5px solid #f5f5f5',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
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
              disabled={!item.permission}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.permission ? item.icon : <FaLock />} {/* Show lock if no permission */}
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
