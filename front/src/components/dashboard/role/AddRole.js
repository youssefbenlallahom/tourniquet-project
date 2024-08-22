import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, FormControl, InputLabel, Card, CardContent } from '@mui/material';
import axiosInstance from '../../../axiosInstance'; 
import Layout from '../../../Layout';

const AddRole = () => {
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState([]);
  const [type, setType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accessResponse, timezoneResponse] = await Promise.all([
          axiosInstance.get('/access/all/'),
          axiosInstance.get('/timezone/all/')
        ]);
        setAccesses(accessResponse.data);
        setTimezones(timezoneResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddRole = async () => {
    const newRole = {
      roleName,
      access: selectedAccess,
      timezone: selectedTimezone,
      type,
    };
  
    try {
      const response = await axiosInstance.post('/role/create/', newRole);
      if (response.status === 201) {
        console.log('Role created successfully:', response.data);
        setRoleName('');
        setSelectedAccess([]);
        setSelectedTimezone([]);
        setType('');
      }
    } catch (error) {
      console.error('Error creating role:', error.response?.data || error.message);
    }
  };

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Role
        </Typography>
        <Card>
          <CardContent>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Access</InputLabel>
              <Select
                multiple
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
              >
                {accesses.map((access) => (
                  <MenuItem key={access.id} value={access.id}>
                    {access.GameName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                multiple
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
              >
                {timezones.map((timezone) => (
                  <MenuItem key={timezone.id} value={timezone.id}>
                    {timezone.TimezoneId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="E">E</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="E/S">E/S</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" color="primary" onClick={handleAddRole}>
              Add Role
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default AddRole;