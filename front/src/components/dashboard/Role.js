// src/components/dashboard/role/Role.js
import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent } from '@mui/material';
import { Delete, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../../axiosInstance'; 

const Role = () => {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // Fetch roles from the backend API
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/role/all/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    // Fetch accesses from the backend API
    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setAccesses(response.data);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      }
    };

    fetchRoles();
    fetchAccesses();
  }, []);

  const handleAddRole = async () => {
    const newRole = {
      name: roleName,
      access: selectedAccess,
      startTime: startTime,
      endTime: endTime,
    };

    try {
      const response = await axiosInstance.post('/role/create/', newRole);
      if (response.status === 201) {
        console.log('Role created successfully:', response.data);
        setOpen(false); // Close the modal
        setRoleName('');
        setSelectedAccess('');
        setStartTime('');
        setEndTime('');
        setRoles([...roles, response.data]); // Update roles list
      } else {
        console.error('Failed to create role:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveRole = async (roleId) => {
    try {
      const response = await axiosInstance.delete(`/role/delete/${roleId}/`);
      if (response.status === 204) { // Assuming 204 status code for successful deletion
        console.log('Role removed successfully');
        setRoles(roles.filter(role => role.id !== roleId)); // Remove role from the list
      } else {
        console.error('Failed to remove role:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add Role
        </Button>
      </Box>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add Role
          </Typography>
          <TextField
            label="Role Name"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Access</InputLabel>
            <Select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
            >
              {accesses.map(access => (
                <MenuItem key={access.id} value={access.id}>
                  {access.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="End Time"
            type="time"
            fullWidth
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button variant="contained" color="primary" onClick={handleAddRole} sx={{ mt: 2 }}>
            Add Role
          </Button>
        </Box>
      </Modal>

      {/* Display List of Roles */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Existing Roles
        </Typography>
        <List>
          {roles.map((role) => (
            <Card key={role.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={`Role: ${role.name}`}
                    secondary={`Access: ${role.access.name}, Start Time: ${role.startTime}, End Time: ${role.endTime}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveRole(role.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </CardContent>
              <Divider />
            </Card>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Role;
