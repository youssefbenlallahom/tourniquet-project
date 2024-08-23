import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Role = () => {
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/role/all/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleDelete = async (roleId) => {
    try {
      await axiosInstance.delete(`/role/delete/${roleId}/`);
      setRoles(roles.filter(role => role.id !== roleId)); // Remove the deleted role from the list
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleEdit = (roleId) => {
    navigate(`/dashboard/roles/edit/${roleId}`);
  };

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>
          Roles Management
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', mb: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/roles/new')}>
            Add Role
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Role Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Access</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Timezone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No roles available
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell>
                      {role.access && Array.isArray(role.access) && role.access.length > 0 
                        ? role.access.map((access) => access.GameName || 'Unknown').join(', ')
                        : 'No access'}
                    </TableCell>
                    <TableCell>
                      {role.timezone && Array.isArray(role.timezone) && role.timezone.length > 0 
                        ? role.timezone.map((tz) => {
                            const startTime = new Date(tz.startTime);
                            const endTime = new Date(tz.endTime);
                            return !isNaN(startTime) && !isNaN(endTime) 
                              ? `Start: ${startTime.toLocaleString()} - End: ${endTime.toLocaleString()}`
                              : 'Invalid Date';
                          }).join(', ')
                        : 'No timezone'}
                    </TableCell>
                    <TableCell>{role.type}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(role.id)}>
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(role.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
};

export default Role;
