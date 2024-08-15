import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent, Grid } from '@mui/material';
import { Delete, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';

const Access = () => {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [doorOptions, setDoorOptions] = useState([]);
  const [selectedDoors, setSelectedDoors] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [door, setDoor] = useState({
    device: '',
    type: '',
    port: '',
    doorNumber: '',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchDoors = async () => {
      try {
        const response = await axiosInstance.get('/door/all/');
        setDoorOptions(response.data);
      } catch (error) {
        console.error('Error fetching doors:', error);
      }
    };

    fetchDoors();
  }, []);

  const handleAddDoor = async () => {
    const { device, type, port, doorNumber } = door;
    const newDoor = {
      device,
      type,
      port: parseInt(port, 10),
      doorNumber: parseInt(doorNumber, 10),
    };

    try {
      const response = await axiosInstance.post('/door/create/', newDoor);
      if (response.status === 201) {
        console.log('Door created successfully:', response.data);
        setDoorOptions([...doorOptions, response.data]);
        setSelectedDoors([...selectedDoors, response.data]);
        setDoor({
          device: '',
          type: '',
          port: '',
          doorNumber: '',
        });
      } else {
        console.error('Failed to create door:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddAccess = async () => {
    const newAccess = {
      name: roomName,
      doors: selectedDoors.map(d => d.id), // Assuming doors have an `id` property
    };

    try {
      const response = await axiosInstance.post('/access/create/', newAccess);
      if (response.status === 201) {
        console.log('Access created successfully:', response.data);
        setOpen(false);
        setRoomName('');
        setSelectedDoors([]);
      } else {
        console.error('Failed to create access:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveDoor = (index) => {
    setSelectedDoors(selectedDoors.filter((_, i) => i !== index));
  };

  return (
    <Box p={4}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpen(true)}
          sx={{ mr: 1 }}
        >
          Add Access
        </Button>
      </Box>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
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
          
          {/* Doors Form */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Doors
            </Typography>
            {selectedDoors.map((d, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem>
                    <ListItemText
                      primary={`Device: ${d.device} - Type: ${d.type} - Port: ${d.port} - Number: ${d.doorNumber}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveDoor(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </CardContent>
                <Divider />
              </Card>
            ))}

            {/* Add Door Form */}
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel>Device</InputLabel>
                    <Select
                      value={door.device}
                      onChange={(e) => setDoor({ ...door, device: e.target.value })}
                    >
                      {doorOptions.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.device_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel>Door Type</InputLabel>
                    <Select
                      value={door.type}
                      onChange={(e) => setDoor({ ...door, type: e.target.value })}
                    >
                      <MenuItem value="E">Entry</MenuItem>
                      <MenuItem value="S">Exit</MenuItem>
                      <MenuItem value="E/S">Entry/Exit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Port"
                    type="number"
                    fullWidth
                    value={door.port}
                    onChange={(e) => setDoor({ ...door, port: e.target.value })}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Door Number"
                    type="number"
                    fullWidth
                    value={door.doorNumber}
                    onChange={(e) => setDoor({ ...door, doorNumber: e.target.value })}
                  />
                </Grid>
              </Grid>
              <IconButton
                color="primary"
                onClick={handleAddDoor}
                sx={{ ml: 2 }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <Button variant="contained" color="primary" onClick={handleAddAccess} sx={{ mt: 2 }}>
            Add Access
          </Button>
        </Box>
      </Modal>

      {/* Display List of Accesses */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Existing Accesses
        </Typography>
        <List>
          {rooms.map((room) => (
            <Card key={room.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={`Room: ${room.name}`}
                    secondary={`Doors: ${room.doors.map(d => `Device ${d.device}, Type ${d.type}`).join(', ')}`}
                  />
                </ListItem>
              </CardContent>
            </Card>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Access;
