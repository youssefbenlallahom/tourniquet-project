import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Autocomplete } from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const AddAssignment = () => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(null);
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

    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setAccesses(response.data);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      }
    };

    const fetchTimezones = async () => {
      try {
        const response = await axiosInstance.get('/timezone/all/');
        setTimezones(response.data);
      } catch (error) {
        console.error('Error fetching timezones:', error);
      }
    };

    fetchRoles();
    fetchAccesses();
    fetchTimezones();
  }, []);

  const handleAddAssignment = async () => {
    const newAssignment = {
      role: selectedRole,
      braceletId: braceletId,
      color: color,
      name: name,
    };

    try {
      const assignmentResponse = await axiosInstance.post('/assignment/create/', newAssignment);
      if (assignmentResponse.status === 201) {
        const newAssignmentAccess = {
          access_id: selectedAccess,
          assignment_id: assignmentResponse.data.id,
          timezone_id: selectedTimezone?.id,
        };

        await axiosInstance.post('/assignment_access/create/', newAssignmentAccess);
        
        console.log('Assignment created successfully:', assignmentResponse.data);
        navigate('/dashboard/assignment'); // Redirect to the assignment list page after submission
      } else {
        console.error('Failed to create assignment:', assignmentResponse.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h6" gutterBottom>
          Add Assignment
        </Typography>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bracelet ID"
          fullWidth
          value={braceletId}
          onChange={(e) => setBraceletId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Color"
          fullWidth
          value={color}
          onChange={(e) => setColor(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.roleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Access</InputLabel>
          <Select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
          >
            {accesses.map(access => (
              <MenuItem key={access.id} value={access.id}>
                {access.GameName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          value={selectedTimezone}
          onChange={(event, newValue) => {
            setSelectedTimezone(newValue);
          }}
          options={timezones}
          getOptionLabel={(option) => `Timezone ID: ${option.TimezoneId} - ${new Date(option.startTime).toLocaleString()} to ${new Date(option.endTime).toLocaleString()}`}
          renderInput={(params) => <TextField {...params} label="Timezone" variant="outlined" fullWidth />}
        />
        <Button variant="contained" color="primary" onClick={handleAddAssignment} sx={{ mt: 2 }}>
          Add Assignment
        </Button>
      </Box>
    </Layout>
  );
};

export default AddAssignment;
