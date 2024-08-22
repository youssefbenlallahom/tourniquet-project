import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Grid, Fab, Tooltip, Modal,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Checkbox,
  CircularProgress, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../Layout';

const AddAccess = () => {
  const [gameName, setGameName] = useState('');
  const [selectedDoorIds, setSelectedDoorIds] = useState([]);
  const [doors, setDoors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newDoor, setNewDoor] = useState({ device: '', type: '', doorNumber: '' });
  const [editDoor, setEditDoor] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDoorsFromLocalStorage = () => {
      const storedDoors = localStorage.getItem('doors');
      if (storedDoors) {
        const doorsFromStorage = JSON.parse(storedDoors);
        setDoors(doorsFromStorage);
        const selectedIds = doorsFromStorage.filter(door => door.select).map(door => door.id);
        setSelectedDoorIds(selectedIds);
      }
    };

    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        setDevices(response.data.map(device => ({
          id: device.DeviceId,
          ip: device.device_ip,
          port: device.port,
          doors: device.nb_doors,
        })));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    loadDoorsFromLocalStorage();
    fetchDevices();
  }, []);

  const updateLocalStorage = (updatedDoors) => {
    const filteredDoors = updatedDoors.map(({ id, ...rest }) => rest); // Remove `id` from each door
    localStorage.setItem('doors', JSON.stringify(filteredDoors));
  };

  const handleCheckboxChange = (doorId) => {
    setDoors((prevDoors) => {
      const updatedDoors = prevDoors.map((door) =>
        door.id === doorId ? { ...door, select: !door.select } : door
      );
      const newSelectedIds = updatedDoors.filter(door => door.select).map(door => door.id);
      setSelectedDoorIds(newSelectedIds);
      updateLocalStorage(updatedDoors); // Update localStorage
      return updatedDoors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation

    // Step 1: Extract selected doors and send to /doors/create/
    const doorsToCreate = doors.filter(door => door.select);
    try {
      // Sending each door for creation
      const createDoorRequests = doorsToCreate.map(door =>
        axiosInstance.post('/door/create/', {
          device: door.device,
          type: door.type,
          doorNumber: door.doorNumber
        })
      );
      const responses = await Promise.all(createDoorRequests);

      // Extract IDs from responses
      const createdDoorIds = responses.map(response => response.data.id);

      // Optional: Wait for a short period before proceeding (e.g., 1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create access with the IDs of the newly created doors
      await axiosInstance.post('/access/create/', {
        GameName: gameName,
        doors: createdDoorIds
      });

      // Clear localStorage
      localStorage.removeItem('doors');

      // Navigate to another page after success
      navigate('/dashboard/access');
    } catch (error) {
      console.error('Error creating doors or access:', error);
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  const handleAddDoor = () => {
    const newDoorWithId = {
      ...newDoor,
      id: Date.now(), // Use timestamp as a unique ID for demo purposes
      select: false,
    };
    setDoors((prevDoors) => {
      const updatedDoors = [...prevDoors, newDoorWithId];
      updateLocalStorage(updatedDoors); // Update localStorage
      return updatedDoors;
    });
    setOpenModal(false);
    setNewDoor({ device: '', type: '', doorNumber: '' });
  };

  const handleEditDoor = () => {
    setDoors((prevDoors) =>
      prevDoors.map((door) => {
        if (door.id === editDoor.id) {
          const updatedDoor = { ...editDoor, select: door.select }; // Keep the existing `select` state
          const updatedDoors = prevDoors.map((d) => (d.id === editDoor.id ? updatedDoor : d));
          updateLocalStorage(updatedDoors); // Update localStorage
          return updatedDoor;
        }
        return door;
      })
    );
    setEditDoor(null);
  };

  const handleDeleteDoor = (doorId) => {
    setDoors((prevDoors) => {
      const updatedDoors = prevDoors.filter((door) => door.id !== doorId);
      updateLocalStorage(updatedDoors); // Update localStorage
      setSelectedDoorIds((prevSelectedDoorIds) => prevSelectedDoorIds.filter(id => id !== doorId));
      return updatedDoors;
    });
  };

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>Add New Access</Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Game Name"
              variant="outlined"
              fullWidth
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              margin="normal"
              sx={{ mb: 4 }}
            />

            <Typography variant="h6" gutterBottom>Doors List</Typography>
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Door Number</TableCell>
                    <TableCell>Select</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doors.map((door) => (
                    <TableRow key={door.id}>
                      <TableCell>{door.id}</TableCell>
                      <TableCell>{door.device}</TableCell>
                      <TableCell>{door.type}</TableCell>
                      <TableCell>{door.doorNumber}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={door.select}
                          onChange={() => handleCheckboxChange(door.id)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditDoor(door)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteDoor(door.id)}>
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Grid container justifyContent="center" sx={{ mt: 4 }}>
              <Tooltip title="Add New Door" arrow>
                <Fab
                  color="secondary"
                  aria-label="add"
                  onClick={() => setOpenModal(true)}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    boxShadow: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1976d2',
                    color: 'white',
                  }}
                >
                  <AddIcon sx={{ fontSize: 30 }} />
                </Fab>
              </Tooltip>
            </Grid>

            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ width: '50%' }}>
                Add Access
              </Button>
            </Grid>
          </form>
        )}

        {/* Add Door Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {editDoor ? 'Edit Door' : 'Add New Door'}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Device</InputLabel>
              <Select
                value={editDoor ? editDoor.device : newDoor.device}
                onChange={(e) => (editDoor ? setEditDoor({ ...editDoor, device: e.target.value }) : setNewDoor({ ...newDoor, device: e.target.value }))}
                label="Device"
              >
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>{device.ip}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={editDoor ? editDoor.type : newDoor.type}
                onChange={(e) => (editDoor ? setEditDoor({ ...editDoor, type: e.target.value }) : setNewDoor({ ...newDoor, type: e.target.value }))}
                label="Type"
              >
                <MenuItem value="E">E</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="E/S">E/S</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Door Number"
              variant="outlined"
              fullWidth
              value={editDoor ? editDoor.doorNumber : newDoor.doorNumber}
              onChange={(e) => (editDoor ? setEditDoor({ ...editDoor, doorNumber: e.target.value }) : setNewDoor({ ...newDoor, doorNumber: e.target.value }))}
              margin="normal"
            />
            <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Grid item>
                <Button onClick={() => setOpenModal(false)}>Cancel</Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={editDoor ? handleEditDoor : handleAddDoor}
                  variant="contained"
                  color="primary"
                >
                  {editDoor ? 'Update' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      </Box>
    </Layout>
  );
};

export default AddAccess;
