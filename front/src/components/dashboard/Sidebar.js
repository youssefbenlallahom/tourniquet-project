import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Drawer,
  Typography,
  Avatar,
  Tooltip,
  Collapse,
  Badge,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosInstance';
import { 
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  EventNote as EventIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  LockOutlined as LockIcon,
  Add as AddIcon
} from '@mui/icons-material';

const drawerWidth = 212;

const CustomDrawer = styled(Drawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  position: 'fixed',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#0B1929', 
    color: '#f5f5f5',
    overflow: 'hidden',
    overflowY: 'auto',
    border: 'none',
    zIndex: 1200,
  },
}));

const CustomListItem = styled(ListItem)(({ theme, selected, disabled }) => ({
  transition: theme.transitions.create(['background-color', 'transform', 'margin'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: selected ? 'rgba(179, 0, 0, 0.16)' : 'transparent',
  color: disabled ? 'rgba(255, 255, 255, 0.5)' : '#fff',
  borderRadius: '8px',
  margin: '4px 8px',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: disabled ? 'transparent' : selected ? 'rgba(179, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  '&.Mui-selected': {
    backgroundColor: disabled ? 'transparent' : 'rgba(179, 0, 0, 0.16)',
  },
}));

const ListItemIconStyled = styled(ListItemIcon)({
  minWidth: 40,
  color: 'inherit',
});

const Sidebar = () => {
  const location = useLocation();
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Auto collapse on mobile
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Fetch the user's permissions from the API
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/user/profile/');
        setPermissions(response.data);
        setUserName(response.data.username || '');
        setUserRole(response.data.role || '');
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load user data.');
      }
    };

    fetchProfileData();
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <HomeIcon />, 
      path: '/dashboard/home', 
      permission: true,
      badge: null
    },
    { 
      text: 'Assignments', 
      icon: <AssignmentIcon />, 
      path: '/dashboard/assignment', 
      permission: permissions.can_manage_assignment,
      badge: null,
      subItems: [
        { 
          text: 'New Assignment', 
          icon: <AddIcon />, 
          path: '/dashboard/assignment/new', 
          permission: permissions.can_manage_assignment
        }
      ]
    }
  ];

  // Animation variants
  const sidebarVariants = {
    open: { width: drawerWidth },
    closed: { width: 70 }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 }
  };

  if (error) return <div>{error}</div>;

  return (
    <motion.div
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <CustomDrawer 
        variant="permanent" 
        anchor="left" 
        open={open}
      >
        <Box>
          <Box 
            sx={{ 
              padding: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}
          >
            <IconButton
              onClick={toggleDrawer}
              sx={{
                position: 'absolute',
                right: open ? 8 : '50%',
                top: open ? 8 : 8,
                transform: open ? 'none' : 'translateX(50%)',
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            
            <motion.div
              animate={{ scale: [0.9, 1], opacity: [0, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                src="/assets/logo.png"
                alt="Logo"
                sx={{
                  width: open ? 80 : 40,
                  height: open ? 80 : 40,
                  marginBottom: open ? 2 : 0.5,
                  marginTop: open ? 2 : 0.5,
                  transition: 'all 0.3s ease',
                  border: '2px solid #B30000',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                }}
              />
            </motion.div>

            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color="#B30000"
                  sx={{ textAlign: 'center' }}
                >
                  Game Production
                  <Typography variant="caption" display="block" color="rgba(255,255,255,0.7)">
                    Admin
                  </Typography>
                </Typography>
              </motion.div>
            )}
          </Box>

          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => setProfileExpanded(!profileExpanded)}
              >
                <Avatar sx={{ bgcolor: '#B30000', mb: 1 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="medium">
                  {userName || 'User'}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  {userRole || 'Role not assigned'}
                </Typography>
              </Box>
            </motion.div>
          )}

          <List sx={{ mt: 1 }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.path}>
                <Tooltip title={!open ? item.text : ""} placement="right">
                  <CustomListItem
                    button
                    component={Link}
                    to={item.path}
                    selected={location.pathname === item.path}
                    disabled={!item.permission}
                    sx={{
                      minHeight: 48,
                      px: open ? 2.5 : 'auto',
                      justifyContent: open ? 'initial' : 'center',
                    }}
                  >
                    <ListItemIconStyled>
                      {item.badge ? (
                        <Badge badgeContent={item.badge} color="error">
                          {item.permission ? item.icon : <LockIcon />}
                        </Badge>
                      ) : (
                        item.permission ? item.icon : <LockIcon />
                      )}
                    </ListItemIconStyled>
                    
                    {open && (
                      <motion.div
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        style={{ width: '100%' }}
                      >
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{ 
                            fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                          }} 
                        />
                      </motion.div>
                    )}
                  </CustomListItem>
                </Tooltip>
                
                {/* Render sub-items if any and if parent is allowed */}
                {open && item.subItems && item.permission && (
                  <Collapse in={location.pathname.includes(item.path)} timeout="auto">
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <Tooltip key={subItem.path} title={!open ? subItem.text : ""} placement="right">
                          <CustomListItem
                            button
                            component={Link}
                            to={subItem.path}
                            selected={location.pathname === subItem.path}
                            disabled={!subItem.permission}
                            sx={{
                              pl: 4,
                              minHeight: 40,
                              borderLeft: '1px solid rgba(144, 202, 249, 0.5)',
                              ml: 4,
                            }}
                          >
                            <ListItemIconStyled sx={{ minWidth: 36 }}>
                              {subItem.permission ? subItem.icon : <LockIcon fontSize="small" />}
                            </ListItemIconStyled>
                            
                            {open && (
                              <motion.div
                                variants={itemVariants}
                                style={{ width: '100%' }}
                              >
                                <ListItemText 
                                  primary={subItem.text} 
                                  primaryTypographyProps={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: location.pathname === subItem.path ? 'bold' : 'normal'
                                  }} 
                                />
                              </motion.div>
                            )}
                          </CustomListItem>
                        </Tooltip>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {open && (
          <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ display: 'block', textAlign: 'center' }}>
              © 2025 Game Production
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ display: 'block', textAlign: 'center' }}>
              Version 1.0.0
            </Typography>
          </Box>
        )}
      </CustomDrawer>
    </motion.div>
  );
};

export default Sidebar;
