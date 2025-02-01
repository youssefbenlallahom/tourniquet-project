import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Modal, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axiosInstance from '../../../axiosInstance';

const UpdateAccessModal = ({ open, onClose, access, onAccessUpdated }) => {
  const [gameName, setGameName] = useState(access.GameName || '');
  const [doorIds, setDoorIds] = useState(access.doors || []);
  const [availableDoors, setAvailableDoors] = useState([]);
  
  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const response = await axiosInstance.get('/door/all/');
        setAvailableDoors(response.data);
      } catch (error) {
        console.error('Error fetching doors:', error);
      }
    };

    fetchDoors();
  }, []);

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.put(`/access/update/${access.id}/`, {
        GameName: gameName,
        doors: doorIds
      });
      onAccessUpdated(response.data);
    } catch (error) {
      console.error('Error updating access:', error);
      alert('Failed to update access. Please check the console for details.');
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
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Update Access
        </Typography>
        <TextField
          label="Game Name"
          variant="outlined"
          fullWidth
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="door-select-label">Doors</InputLabel>
          <Select
            labelId="door-select-label"
            multiple
            value={doorIds}
            onChange={(e) => setDoorIds(e.target.value)}
            renderValue={(selected) => (
              <Box>
                {selected.map(id => {
                  const door = availableDoors.find(d => d.id === id);
                  return door ? door.device : '';
                }).join(', ')}
              </Box>
            )}
            label="Doors"
          >
            {availableDoors.map(door => (
              <MenuItem key={door.id} value={door.id}>
                {door.device} (Type: {door.type})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} color="primary" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateAccessModal;