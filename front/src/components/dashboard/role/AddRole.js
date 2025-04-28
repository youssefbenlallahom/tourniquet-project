import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, FormControl, InputLabel, Card, CardContent, Chip } from '@mui/material';
import axiosInstance from '../../../axiosInstance'; 
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const AddRole = () => {
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState([]);
  const [type, setType] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

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
        // Clear form fields
        setRoleName('');
        setSelectedAccess([]);
        setSelectedTimezone([]);
        setType('');
        // Redirect to /roles
        navigate('/dashboard/roles');
      }
    } catch (error) {
      console.error('Error creating role:', error.response?.data || error.message);
    }
  };

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'black' }}>
          Add New Role
        </Typography>
        <Card sx={{ maxWidth: 600, margin: '0 auto', boxShadow: 3 }}>
          <CardContent>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Access</InputLabel>
              <Select
                multiple
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={accesses.find(a => a.id === value)?.GameName} />
                    ))}
                  </Box>
                )}
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
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone([e.target.value])}  // Always set as an array
                renderValue={(value) => {
                  const tz = timezones.find(t => t.TimezoneId === value[0]); 
                  return tz ? `${new Date(tz?.startTime).toLocaleString()} - ${new Date(tz?.endTime).toLocaleString()}` : 'No timezone selected';
                }}
              >
                {timezones.map((timezone) => {
                  console.log(timezone)
                  return (
                    <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                      {new Date(timezone.startTime).toLocaleString()} - {new Date(timezone.endTime).toLocaleString()} 
                    </MenuItem>
                  )
                })}
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

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddRole} sx={{ padding: '10px 20px' }}>
                Add Role
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default AddRole;
