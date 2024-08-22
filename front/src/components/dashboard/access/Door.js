import React, { useState, useEffect } from 'react';
import {
  Box, Button, MenuItem, Select, TextField, Typography, Modal,
  FormControl, InputLabel
} from '@mui/material';
import axiosInstance from '../../../axiosInstance'; // Assurez-vous que vous avez importé axiosInstance

const Door = ({ open, onClose, onDoorAdded }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [doorType, setDoorType] = useState('');
  const [port, setPort] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [temporaryDoors, setTemporaryDoors] = useState(() => {
    // Charger les portes depuis le local storage au chargement du composant
    const savedDoors = localStorage.getItem('temporaryDoors');
    return savedDoors ? JSON.parse(savedDoors) : [];
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleAddDoor = () => {
    const newDoor = {
      id: Date.now(), // Utiliser Date.now() pour générer un ID unique temporairement
      device: selectedDevice || '',
      type: doorType,
      port: parseInt(port, 10),
      doorNumber: parseInt(doorNumber, 10),
    };

    // Vérifier si la porte existe déjà dans la liste temporaire
    const doorExists = temporaryDoors.some((door) =>
      door.device === newDoor.device &&
      door.type === newDoor.type &&
      door.port === newDoor.port &&
      door.doorNumber === newDoor.doorNumber
    );

    if (!doorExists) {
      // Ajouter la nouvelle porte à la liste temporaire
      const updatedDoors = [...temporaryDoors, newDoor];
      setTemporaryDoors(updatedDoors);

      // Stocker la liste mise à jour dans le local storage
      localStorage.setItem('temporaryDoors', JSON.stringify(updatedDoors));

      // Réinitialiser les champs du formulaire
      setSelectedDevice('');
      setDoorType('');
      setPort('');
      setDoorNumber('');

      // Notifier le parent que la porte a été ajoutée
      onDoorAdded(newDoor);
    } else {
      alert('Door already exists.');
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
            value={selectedDevice || ''}
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

        {/* Liste des portes ajoutées temporairement */}
        <Typography variant="h6" gutterBottom>
          Temporary Doors List
        </Typography>
        {temporaryDoors.map((door) => (
          <Typography key={door.id}>
            {`Device: ${door.device}, Type: ${door.type}, Port: ${door.port}, Door Number: ${door.doorNumber}`}
          </Typography>
        ))}
      </Box>
    </Modal>
  );
};

export default Door;
