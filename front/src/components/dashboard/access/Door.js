import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel } from '@mui/material';
import axiosInstance from '../../../axiosInstance'; // Adjust import path as needed

const Door = ({ open, onClose, onDoorsConfirmed }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [doorType, setDoorType] = useState('');
  const [port, setPort] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [temporaryDoors, setTemporaryDoors] = useState([]);

  useEffect(() => {
    // Fetch devices from the backend
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        console.log('Devices fetched:', response.data);
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleAddDoor = () => {
    // Create a new door object
    const newDoor = {
      device: selectedDevice,
      type: doorType,
      port: parseInt(port, 10),
      doorNumber: parseInt(doorNumber, 10),
    };

    // Add the new door to the temporary array
    setTemporaryDoors([...temporaryDoors, newDoor]);

    // Reset input fields
    setSelectedDevice('');
    setDoorType('');
    setPort('');
    setDoorNumber('');
  };

  const handleConfirmDoors = async () => {
    try {
      // Send the doors to the backend
      const response = await axiosInstance.post('/door/create/', { doors: temporaryDoors });
      if (response.status === 201) {
        console.log('Doors created successfully:', response.data);
        onDoorsConfirmed(); // Notify the parent component to refresh or update state
        setTemporaryDoors([]); // Clear the temporary list
        onClose(); // Close the modal
      } else {
        console.error('Failed to create doors:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add Door
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Device</InputLabel>
          <Select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {devices.map(device => (
              <MenuItem key={device.DeviceId} value={device.DeviceId}>
                {device.device_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Door Type</InputLabel>
          <Select
            value={doorType}
            onChange={(e) => setDoorType(e.target.value)}
          >
            <MenuItem value="E">Entry</MenuItem>
            <MenuItem value="S">Exit</MenuItem>
            <MenuItem value="E/S">Entry/Exit</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Port"
          type="number"
          fullWidth
          value={port}
          onChange={(e) => setPort(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Door Number"
          type="number"
          fullWidth
          value={doorNumber}
          onChange={(e) => setDoorNumber(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleAddDoor}>
          Add Door
        </Button>
        <Button variant="contained" color="secondary" onClick={handleConfirmDoors} sx={{ mt: 2 }}>
          Confirm Doors
        </Button>
      </Box>
    </Modal>
  );
};

export default Door;
