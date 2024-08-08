import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent } from '@mui/material';
import { Delete, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance'; // Adjust the import path if necessary
import Door from './Door'; // Adjust the import path if necessary

const Access = () => {
  const [open, setOpen] = useState(false);
  const [openDoorModal, setOpenDoorModal] = useState(false); // State for the door modal
  const [roomName, setRoomName] = useState('');
  const [doors, setDoors] = useState([]);
  const [selectedDoor, setSelectedDoor] = useState('');

  useEffect(() => {
    // Fetch doors from the backend API
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

  const handleAddAccess = async () => {
    const newAccess = {
      name: roomName,
      doors: [selectedDoor],
    };

    try {
      const response = await axiosInstance.post('/access/create/', newAccess);
      if (response.status === 201) {
        console.log('Access created successfully:', response.data);
        setOpen(false); // Close the modal
        setRoomName('');
        setSelectedDoor('');
      } else {
        console.error('Failed to create access:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDoorAdded = () => {
    // Refresh doors when a new door is added
    const fetchDoors = async () => {
      try {
        const response = await axiosInstance.get('/door/all/');
        setDoors(response.data);
      } catch (error) {
        console.error('Error fetching doors:', error);
      }
    };
    fetchDoors();
  };

  const handleRemoveDoor = async (doorId) => {
    try {
      const response = await axiosInstance.delete(`/door/delete/${doorId}/`);
      if (response.status === 204) { // Assuming 204 status code for successful deletion
        console.log('Door removed successfully');
        // Refresh doors after removal
        handleDoorAdded();
      } else {
        console.error('Failed to remove door:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box p={4}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpen(true)}
          sx={{ mr: 1 }} // Add margin-right for spacing
        >
          Add Access
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDoorModal(true)}
          sx={{ ml: 1 }} // Add margin-left for spacing
        >
          Add Door
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
            Add Access
          </Typography>
          <TextField
            label="Room Name"
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Door</InputLabel>
            <Select
              value={selectedDoor}
              onChange={(e) => setSelectedDoor(e.target.value)}
            >
              {doors.map(door => (
                <MenuItem key={door.id} value={door.id}>
                  {door.device} - {door.type} - Port: {door.port}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleAddAccess} sx={{ mt: 2 }}>
            Add Access
          </Button>
        </Box>
      </Modal>

      {/* Door Modal */}
      <Door open={openDoorModal} onClose={() => setOpenDoorModal(false)} onDoorAdded={handleDoorAdded} />

      {/* Display List of Doors */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Existing Doors
        </Typography>
        <List>
          {doors.map((door) => (
            <Card key={door.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={`- Adresse IP : ${door.device_ip} - Type : ${door.type} - Port: ${door.port}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDoor(door.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </CardContent>
              <Divider />
            </Card>
          ))}
        </List>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDoorModal(true)}
            sx={{
              borderRadius: '50%',
              width: 56,
              height: 56,
              minWidth: '0',
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <AddIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Access;
