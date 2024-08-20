import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Paper } from '@mui/material';
import axiosInstance from '../../../axiosInstance'; // Adjust the path if needed
import Layout from '../../../Layout';
const AddDeviceModal = ({ open, onClose, onAddDevice }) => {
  const [deviceIp, setDeviceIp] = useState('');
  const [port, setPort] = useState('4307'); // Default value set to 4307
  const [doorCount, setDoorCount] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newDevice = {
      device_ip: deviceIp,
      port: port,
      nb_doors: parseInt(doorCount, 10), // Update field name
    };

    try {
      const response = await axiosInstance.post('/device/create/', newDevice);
      if (response.status === 201) {
        onAddDevice(response.data);
        onClose();
        setDeviceIp('');
        setPort('4307'); // Reset to default value
        setDoorCount('');
      } else {
        console.error('Failed to add device:', response.statusText);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <Layout>
    <Modal open={open} onClose={onClose}>
      <Box
        component={Paper}
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          padding: 4, 
          width: 400 
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add Device
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Device IP"
              variant="outlined"
              fullWidth
              value={deviceIp}
              onChange={(e) => setDeviceIp(e.target.value)}
              required
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Port"
              variant="outlined"
              fullWidth
              value={port}
              onChange={(e) => setPort(e.target.value)}
              required
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Number of Doors"
              variant="outlined"
              type="number"
              fullWidth
              value={doorCount}
              onChange={(e) => setDoorCount(e.target.value)}
              required
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Device
          </Button>
        </form>
      </Box>
    </Modal>
    </Layout>
  );
};

export default AddDeviceModal;
