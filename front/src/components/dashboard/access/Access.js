import React, { useState, useEffect } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography } from '@mui/material';
import { Add as AddIcon, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';

const Access = () => {
  const [accesses, setAccesses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setAccesses(response.data);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      }
    };

    fetchAccesses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/access/delete/${id}/`);
      setAccesses(accesses.filter(access => access.id !== id));
    } catch (error) {
      console.error('Error deleting access:', error);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/access/update/${id}`);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Access Configuration</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/access/new')}>
          Add Access
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Game Name</TableCell>
            <TableCell>Doors</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accesses.map((access) => (
            <TableRow key={access.id}>
              <TableCell>{access.GameName}</TableCell>
              <TableCell>{access.doors.map(door => `Device ${door.device}, Type ${door.type}`).join(', ')}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleUpdate(access.id)}>
                  <Edit />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(access.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Access;
