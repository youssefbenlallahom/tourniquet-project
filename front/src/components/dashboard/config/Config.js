import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddDeviceModal from './AddDeviceModal';
import axiosInstance from '../../../axiosInstance'; // Adjust the path if needed

const Config = () => {
  const [devices, setDevices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch devices from backend when component mounts
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        setDevices(response.data.map(device => ({
          id: device.DeviceId,
          ip: device.device_ip,
          name: device.device_name,
          ports: device.nb_port,
        })));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleAddDevice = (device) => {
    setDevices([...devices, {
      id: device.DeviceId, // Use the ID from the response
      ip: device.device_ip,
      name: device.device_name,
      ports: device.nb_port,
    }]);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'ip', headerName: 'IP Address', width: 150 },
    { field: 'name', headerName: 'Device Name', width: 150 },
    { field: 'ports', headerName: 'Number of Ports', width: 150 },
  ];

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Devices</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Add Device
        </Button>
      </Box>
      <Paper elevation={3} sx={{ height: 400, width: '100%' }}>
        <DataGrid rows={devices} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
      </Paper>
      <AddDeviceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDevice={handleAddDevice}
      />
    </Box>
  );
};

export default Config;
