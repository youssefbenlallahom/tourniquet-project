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
  const [selectedDoors, setSelectedDoors] = useState([]);
  const [doors, setDoors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newDoor, setNewDoor] = useState({ device: '', type: '', doorNumber: '' });
  const [editDoor, setEditDoor] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchDoors();
    fetchDevices();
  }, []);

  const handleCheckboxChange = (doorId) => {
    setSelectedDoors((prevSelected) =>
      prevSelected.includes(doorId)
        ? prevSelected.filter((id) => id !== doorId)
        : [...prevSelected, doorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/access/create/', { GameName: gameName, doors: selectedDoors });
      navigate('/dashboard/access');
    } catch (error) {
      console.error('Error creating access:', error);
    }
  };

  const handleAddDoor = async () => {
    try {
      const response = await axiosInstance.post('/door/create/', newDoor);
      setDoors((prevDoors) => [...prevDoors, response.data]);
      setOpenModal(false);
      setNewDoor({ device: '', type: '', doorNumber: '' });
    } catch (error) {
      console.error('Error adding door:', error);
    }
  };

  const handleEditDoor = async () => {
    try {
      await axiosInstance.put(`/door/update/${editDoor.id}/`, editDoor);
      setDoors((prevDoors) =>
        prevDoors.map((door) => (door.id === editDoor.id ? editDoor : door))
      );
      setEditDoor(null);
    } catch (error) {
      console.error('Error updating door:', error);
    }
  };

  const handleDeleteDoor = async (doorId) => {
    try {
      await axiosInstance.delete(`/door/delete/${doorId}/`);
      setDoors((prevDoors) => prevDoors.filter((door) => door.id !== doorId));
    } catch (error) {
      console.error('Error deleting door:', error);
    }
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
                        checked={selectedDoors.includes(door.id)}
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
            border: '1px solid #ddd',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom>{editDoor ? 'Edit Door' : 'Add a New Door'}</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Device</InputLabel>
            <Select
              value={editDoor ? editDoor.device : newDoor.device}
              onChange={(e) => (editDoor ? setEditDoor({ ...editDoor, device: e.target.value }) : setNewDoor({ ...newDoor, device: e.target.value }))}
              fullWidth
            >
              {devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {`Device ${device.id} - ${device.ip}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={editDoor ? editDoor.type : newDoor.type}
              onChange={(e) => (editDoor ? setEditDoor({ ...editDoor, type: e.target.value }) : setNewDoor({ ...newDoor, type: e.target.value }))}
              fullWidth
            >
              <MenuItem value={'E'}>Entry (E)</MenuItem>
              <MenuItem value={'S'}>Sortie (S)</MenuItem>
              <MenuItem value={'E/S'}>Entry/Sortie (E/S)</MenuItem>
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
          <Button onClick={editDoor ? handleEditDoor : handleAddDoor} variant="contained" color="primary" sx={{ mt: 2 }}>
            {editDoor ? 'Update Door' : 'Add Door'}
          </Button>
        </Box>
      </Modal>
    </Box>
    </Layout>
  );
};

export default AddAccess;
