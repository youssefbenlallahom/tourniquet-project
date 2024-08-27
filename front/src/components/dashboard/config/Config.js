import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Card, CardContent, CardActions, IconButton, Tooltip, Modal, TextField, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../../axiosInstance'; // Adjust the path if needed
import Layout from '../../../Layout';
import AddDeviceModal from './AddDeviceModal'; // Assuming this is for adding new devices

const Config = () => {
  const [devices, setDevices] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editFormData, setEditFormData] = useState({ device_ip: '', port: '', nb_doors: '' });

  useEffect(() => {
    // Fetch devices from backend when component mounts
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        setDevices(response.data.map(device => ({
          id: device.DeviceId,
          device_ip: device.device_ip,
          port: device.port,
          nb_doors: device.nb_doors,
        })));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleAddDevice = (device) => {
    setDevices([...devices, {
      id: device.DeviceId,
      device_ip: device.device_ip,
      port: device.port,
      nb_doors: device.nb_doors,
    }]);
  };

  const handleEditDevice = async () => {
    try {
      const response = await axiosInstance.put(`/device/update/${selectedDevice.id}/`, editFormData);
      setDevices(devices.map(d => d.id === response.data.DeviceId ? response.data : d));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      await axiosInstance.delete(`/device/delete/${id}/`);
      setDevices(devices.filter(device => device.id !== id));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>
          Devices
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', mb: 4 }}>
          <Button variant="contained" color="primary" onClick={() => setIsAddModalOpen(true)}>
            Add Device
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {devices.map(device => (
            <Card key={device.id} sx={{ width: 300 }}>
              <CardContent>
                <Typography variant="h6">{`ID: ${device.id}`}</Typography>
                <Typography variant="body1">{`IP Address: ${device.device_ip}`}</Typography>
                <Typography variant="body1">{`Port: ${device.port}`}</Typography>
                <Typography variant="body1">{`Number of Doors: ${device.nb_doors}`}</Typography>
              </CardContent>
              <CardActions>
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={() => {
                    setSelectedDevice(device);
                    setEditFormData({
                      device_ip: device.device_ip,
                      port: device.port,
                      nb_doors: device.nb_doors,
                    });
                    setIsEditModalOpen(true);
                  }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDeleteDevice(device.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Add Device Modal */}
        <AddDeviceModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddDevice={handleAddDevice}
        />

        {/* Edit Device Modal */}
        <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <Box sx={{
            width: 400,
            padding: 3,
            margin: 'auto',
            marginTop: '10%',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="h6" gutterBottom>
              Edit Device
            </Typography>
            <Divider />
            <TextField
              label="IP Address"
              name="device_ip"
              value={editFormData.device_ip}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Port"
              name="port"
              value={editFormData.port}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Number of Doors"
              name="nb_doors"
              value={editFormData.nb_doors}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" color="primary" onClick={handleEditDevice}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Layout>
  );
};

export default Config;