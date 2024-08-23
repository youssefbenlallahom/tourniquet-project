import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Modal, FormControl, InputLabel, 
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Autocomplete, Select, MenuItem, Snackbar, CircularProgress, Fade
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axiosInstance from '../../axiosInstance';
import Layout from '../../Layout';

const Assignment = () => {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentResponse, roleResponse, accessResponse, timezoneResponse] = await Promise.all([
          axiosInstance.get('/assignment/all/'),
          axiosInstance.get('/role/all/'),
          axiosInstance.get('/access/all/'),
          axiosInstance.get('/timezone/all/')
        ]);
        setAssignments(assignmentResponse.data);
        setRoles(roleResponse.data);
        setAccesses(accessResponse.data);
        setTimezones(timezoneResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAssignment = async () => {
    setLoading(true);
    const newAssignment = {
      role: selectedRole,
      braceletId: braceletId,
      color: color,
      name: name,
    };

    try {
      const assignmentResponse = await axiosInstance.post('/assignment/create/', newAssignment);
      if (assignmentResponse.status === 201) {
        const newAssignmentAccess = {
          access_id: selectedAccess,
          assignment_id: assignmentResponse.data.id,
          timezone_id: selectedTimezone?.id,
        };
        await axiosInstance.post('/assignment_access/create/', newAssignmentAccess);
        setAssignments([...assignments, assignmentResponse.data]);
        setSnackbar({ open: true, message: 'Assignment created successfully', severity: 'success' });
        setOpen(false);
        setBraceletId('');
        setColor('');
        setName('');
        setSelectedRole('');
        setSelectedAccess('');
        setSelectedTimezone(null);
      } else {
        setSnackbar({ open: true, message: 'Failed to create assignment', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/assignment/delete/${assignmentId}/`);
      if (response.status === 204) {
        setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
        setSnackbar({ open: true, message: 'Assignment removed successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Failed to remove assignment', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h5" gutterBottom>
          Assignments
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Add Assignment
        </Button>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Bracelet ID</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.name}</TableCell>
                    <TableCell>{assignment.braceletId}</TableCell>
                    <TableCell>{assignment.color}</TableCell>
                    <TableCell>{assignment.role}</TableCell>
                    <TableCell>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAssignment(assignment.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal open={open} onClose={() => setOpen(false)}>
          <Fade in={open} timeout={500}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 550,
                bgcolor: 'background.paper',
                p: 4,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Add Assignment
              </Typography>
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Bracelet ID"
                fullWidth
                value={braceletId}
                onChange={(e) => setBraceletId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Color"
                fullWidth
                value={color}
                onChange={(e) => setColor(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.roleName}
                      
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Access</InputLabel>
                <Select
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                >
                  {accesses.map(access => (
                    <MenuItem key={access.id} value={access.id}>
                      {access.GameName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                value={selectedTimezone}
                onChange={(event, newValue) => {
                  setSelectedTimezone(newValue);
                }}
                options={timezones}
                getOptionLabel={(option) => 
                  `Start time:${new Date(option.startTime).toLocaleString()} - End time: ${new Date(option.endTime).toLocaleString()}`
                }
                renderInput={(params) => <TextField {...params} label="Timezone" variant="outlined" fullWidth />}
              />
              <Button variant="contained" color="primary" onClick={handleAddAssignment} sx={{ mt: 2 }}>
                Add Assignment
              </Button>
            </Box>
          </Fade>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          severity={snackbar.severity}
        />
      </Box>
    </Layout>
  );
};

export default Assignment;
