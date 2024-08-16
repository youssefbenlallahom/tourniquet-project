// src/components/dashboard/access/AddAccess.js
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance'; // Adjust path if necessary

const AddAccess = () => {
  const [gameName, setGameName] = useState('');
  const [selectedDoors, setSelectedDoors] = useState([]);
  const [doors, setDoors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const response = await axiosInstance.get('/door/all/');
        setDoors(response.data);
      } catch (error) {
        console.error('Error fetching doors:', error);
      }
    };

    fetchDoors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/access/create/', { GameName: gameName, doors: selectedDoors });
      navigate('/dashboard/access'); // Redirect to the Access page
    } catch (error) {
      console.error('Error creating access:', error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Add New Access</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Game Name"
          variant="outlined"
          fullWidth
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Doors</InputLabel>
          <Select
            multiple
            value={selectedDoors}
            onChange={(e) => setSelectedDoors(e.target.value)}
            renderValue={(selected) => selected.join(', ')}
          >
            {doors.map((door) => (
              <MenuItem key={door.id} value={door.id}>
                {`Device ${door.device}, Type ${door.type}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
      </form>
    </Box>
  );
};

export default AddAccess;
