import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent, Autocomplete, Select, MenuItem } from '@mui/material';
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
  const [name, setName] = useState(''); // New state for name
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/assignment/all/');
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/role/all/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setAccesses(response.data);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      }
    };

    const fetchTimezones = async () => {
      try {
        const response = await axiosInstance.get('/timezone/all/');
        setTimezones(response.data);
      } catch (error) {
        console.error('Error fetching timezones:', error);
      }
    };

    fetchAssignments();
    fetchRoles();
    fetchAccesses();
    fetchTimezones();
  }, []);

  const handleAddAssignment = async () => {
    const newAssignment = {
      role: selectedRole,
      braceletId: braceletId,
      color: color,
      name: name, // Include the name field here
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
        
        console.log('Assignment created successfully:', assignmentResponse.data);
        setOpen(false);
        setBraceletId('');
        setColor('');
        setName(''); // Reset name after submission
        setSelectedRole('');
        setSelectedAccess('');
        setSelectedTimezone(null);
        setAssignments([...assignments, assignmentResponse.data]);
      } else {
        console.error('Failed to create assignment:', assignmentResponse.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      const response = await axiosInstance.delete(`/assignment/delete/${assignmentId}/`);
      if (response.status === 204) {
        console.log('Assignment removed successfully');
        setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      } else {
        console.error('Failed to remove assignment:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Add Assignment
          </Button>
        </Box>
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
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
              onChange={(e) => setName(e.target.value)} // Update name state
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
              getOptionLabel={(option) => `Timezone ID: ${option.TimezoneId} - ${new Date(option.startTime).toLocaleString()} to ${new Date(option.endTime).toLocaleString()}`}
              renderInput={(params) => <TextField {...params} label="Timezone" variant="outlined" fullWidth />}
            />
            <Button variant="contained" color="primary" onClick={handleAddAssignment} sx={{ mt: 2 }}>
              Add Assignment
            </Button>
          </Box>
        </Modal>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Existing Assignments
          </Typography>
          <List>
            {assignments.map((assignment) => (
              <Card key={assignment.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem>
                    <ListItemText
                      primary={`Bracelet ID: ${assignment.braceletId}, Color: ${assignment.color}, Name: ${assignment.name}`}
                      secondary={`Role: ${assignment.role}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAssignment(assignment.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </CardContent>
                <Divider />
              </Card>
            ))}
          </List>
        </Box>
      </Box>
    </Layout>
  );
};

export default Assignment;