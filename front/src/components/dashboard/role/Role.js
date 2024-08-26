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
      setRoles(roles.filter((role) => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleEdit = (role) => {
    setEditRole(role);
    fetchAccessesAndTimezones(); // Fetch accesses and timezones when editing a role
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditRole(null);
  };

  const handleUpdateRole = async () => {
    try {
      const response = await axiosInstance.put(`/role/update/${editRole.id}/`, editRole);
      if (response.status === 200) {
        setRoles(roles.map((role) => (role.id === editRole.id ? response.data : role)));
        handleClose();
      }
    } catch (error) {
      console.error('Error updating role:', error);
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
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
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

        {/* Edit Role Modal */}
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
                  {editRole ? 'Edit Role' : 'Add Role'}
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
                        access: e.target.value,
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
                    name="timezone"
                    value={editRole?.timezone || []}
                    onChange={(e) =>
                      setEditRole({
                        ...editRole,
                        timezone: [e.target.value],
                      })
                    }
                    renderValue={(value) => {
                      const tz = timezones.find(
                        (t) => t.TimezoneId === value[0]
                      );
                      return tz
                        ? `${new Date(tz.startTime).toLocaleString()} - ${new Date(
                            tz.endTime
                          ).toLocaleString()}`
                        : '';
                    }}
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                        {new Date(timezone.startTime).toLocaleString()} -{' '}
                        {new Date(timezone.endTime).toLocaleString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={editRole?.type || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="E">E</MenuItem>
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="E/S">E/S</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateRole}
                    sx={{ marginRight: 2 }}
                  >
                    Save
                  </Button>
                  <Button variant="outlined" onClick={handleClose}>
                    Cancel
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
