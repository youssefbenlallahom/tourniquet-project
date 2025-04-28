import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Modal, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Card, CardContent
} from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Role = () => {
  const [roles, setRoles] = useState([]);
  const [editRole, setEditRole] = useState(null); // To hold the role being edited
  const [open, setOpen] = useState(false); // To control the modal visibility
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // To distinguish between add and edit

  useEffect(() => {
    fetchRoles();
    fetchAccessesAndTimezones();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/role/all/');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchAccessesAndTimezones = async () => {
    try {
      const [accessResponse, timezoneResponse] = await Promise.all([
        axiosInstance.get('/access/all/'),
        axiosInstance.get('/timezone/all/'),
      ]);
      setAccesses(accessResponse.data);
      setTimezones(timezoneResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (roleId) => {
    try {
      await axiosInstance.delete(`/role/delete/${roleId}/`);
      await fetchRoles(); // Reload roles after deletion
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleAdd = () => {
    setEditRole({ roleName: '', access: [], timezone: [], type: '' }); // Clear form data
    setIsEditing(false); // Set to add mode
    setOpen(true); // Open modal
  };

  const handleEdit = (role) => {
    setEditRole({
      ...role,
      access: role.access.map((access) => access.id), // Ensure this returns an array of IDs
      timezone: role.timezone.map((tz) => tz.TimezoneId), // Ensure this returns an array containing the timezone ID
    });
    setIsEditing(true); // Set to edit mode
    setOpen(true); // Open modal
  };

  const handleClose = () => {
    setOpen(false);
    setEditRole(null);
  };

  const handleUpdateRole = async () => {
    try {
      const updatedRole = {
        ...editRole,
        access: editRole.access.map((access) => access.id || access),
        timezone: editRole.timezone.map((timezone) => timezone.TimezoneId || timezone),
      };

      const response = await axiosInstance.put(`/role/update/${editRole.id}/`, updatedRole);

      if (response.status === 200) {
        await fetchRoles(); // Reload roles after update
        handleClose();
      }
    } catch (error) {
      console.error('Error updating role:', error.response.data || error.message);
    }
  };

  const handleAddRole = async () => {
    try {
      const newRole = {
        roleName: editRole?.roleName || '',
        access: editRole?.access || [],
        timezone: editRole?.timezone || [],
        type: editRole?.type || '',
      };

      const response = await axiosInstance.post('/role/create/', newRole);

      if (response.status === 201) {
        await fetchRoles(); // Reload roles after creation
        handleClose();
      }
    } catch (error) {
      console.error('Error adding role:', error.response.data || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditRole({ ...editRole, [name]: value });
  };

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'left', color: 'black' }}>
          Roles Management
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', mb: 4 }}>
          <Button variant="contained" color="primary" onClick={handleAdd}>
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
                          <IconButton onClick={() => handleEdit(role)}>
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

        {/* Role Modal */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <Card sx={{ width: 500, padding: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {isEditing ? 'Edit Role' : 'Add Role'}
                </Typography>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Role Name"
                    name="roleName"
                    value={editRole?.roleName || ''}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Access</InputLabel>
                  <Select
                    multiple
                    name="access"
                    value={editRole?.access || []}
                    onChange={(e) =>
                      setEditRole({
                        ...editRole,
                        access: e.target.value, // Ensure this returns an array of IDs
                      })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={accesses.find((a) => a.id === value)?.GameName}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {accesses.map((access) => (
                      <MenuItem key={access.id} value={access.id}>
                        {access.GameName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    multiple
                    name="timezone"
                    value={editRole?.timezone || []}
                    onChange={(e) =>
                      setEditRole({
                        ...editRole,
                        timezone: e.target.value, // Ensure this returns an array of IDs
                      })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={new Date(timezones.find((tz) => tz.TimezoneId === value)?.startTime).toLocaleString() + ' - ' + new Date(timezones.find((tz) => tz.TimezoneId === value)?.endTime).toLocaleString()}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                        {new Date(timezone.startTime).toLocaleString()} - {new Date(timezone.endTime).toLocaleString()} 
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Type"
                    name="type"
                    value={editRole?.type || ''}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={isEditing ? handleUpdateRole : handleAddRole}
                  >
                    {isEditing ? 'Update Role' : 'Add Role'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Modal>
      </Box>
    </Layout>
  );
};

export default Role;
