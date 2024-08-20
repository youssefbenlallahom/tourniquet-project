import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddDeviceModal from './AddDeviceModal';
import axiosInstance from '../../../axiosInstance'; // Adjust the path if needed
import Layout from '../../../Layout';
const Config = () => {
  const [devices, setDevices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch devices from backend when component mounts
    const fetchDevices = async () => {
      try {
        const response = await axiosInstance.get('/device/all/');
        setDevices(response.data.map(device => ({
          id: device.DeviceId,           // 'DeviceId' is used as the unique identifier
          ip: device.device_ip,          // 'device_ip' corresponds to 'ip' in the frontend
          port: device.port,             // 'port' field
          doors: device.nb_doors,        // 'nb_doors' corresponds to 'doors' in the frontend
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
      port: device.port,
      doors: device.nb_doors,
    }]);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'ip', headerName: 'IP Address', width: 150 },
    { field: 'port', headerName: 'Port', width: 150 },
    { field: 'doors', headerName: 'Number of Doors', width: 150 },
  ];

  return (
    <Layout>
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
    </Layout>
  );
};

export default Config;
