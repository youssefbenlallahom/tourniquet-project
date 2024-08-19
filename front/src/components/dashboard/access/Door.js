import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel } from '@mui/material';
import axiosInstance from '../../../axiosInstance'; // Ajustez le chemin d'importation si nécessaire

const Door = ({ open, onClose, onDoorAdded }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(''); // Initialisé comme une chaîne vide
  const [doorType, setDoorType] = useState('');
  const [port, setPort] = useState('');
  const [doorNumber, setDoorNumber] = useState('');

  useEffect(() => {
    // Récupérez les dispositifs depuis l'API backend
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

  const handleAddDoor = async () => {
    const newDoor = {
      device: selectedDevice || '', 
      type: doorType,
      port: parseInt(port, 10),
      doorNumber: parseInt(doorNumber, 10),
    };

    try {
      const response = await axiosInstance.post('/door/create/', newDoor);
      if (response.status === 201) {
        console.log('Door created successfully:', response.data);
        onClose(); // Fermez la fenêtre modale
        onDoorAdded(); // Actualisez les portes dans le composant parent
        setSelectedDevice('');
        setDoorType('');
        setPort('');
        setDoorNumber('');
      } else {
        console.error('Failed to create door:', response.statusText);
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
            value={selectedDevice || ''} // Définir une valeur par défaut
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
      </Box>
    </Modal>
  );
};

export default Door;
