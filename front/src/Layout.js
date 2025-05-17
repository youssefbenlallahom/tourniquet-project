import React from 'react';
import { Box } from '@mui/material';
import './App.css';

const Layout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        paddingTop: '1rem',
        paddingBottom: '2rem',
        minHeight: 'calc(100vh - 60px)',
        background: '#f5f7fa'
      }}
    >
      {children}
    </Box>
  );
};

export default Layout;