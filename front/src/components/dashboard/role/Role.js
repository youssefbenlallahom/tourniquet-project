
import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const Role = () => {
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/role/all/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Roles
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/roles/new')}>
          Add Role
        </Button>
        <List>
          {roles.map((role) => (
            <ListItem key={role.id}>
              <ListItemText primary={role.roleName} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Layout>
  );
};

export default Role;
