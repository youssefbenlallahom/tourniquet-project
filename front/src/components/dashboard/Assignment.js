import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, Modal, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent } from '@mui/material';
import { Delete } from '@mui/icons-material';
import axiosInstance from '../../axiosInstance'; 
import Layout from '../../Layout';
const Assignment = () => {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [startTime, setStartTime] = useState('');
  const [gameName, setGameName] = useState('');
  const [gameDuration, setGameDuration] = useState('');

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

    fetchAssignments();
    fetchRoles();
  }, []);

  const handleAddAssignment = async () => {
    const newAssignment = {
      role: selectedRole,
      braceletId: braceletId,
      color: color,
      startTime: startTime,
      gameName: gameName,
      gameDuration: gameDuration,
    };

    try {
      const response = await axiosInstance.post('/assignment/create/', newAssignment);
      if (response.status === 201) {
        console.log('Assignment created successfully:', response.data);
        setOpen(false); 
        setBraceletId('');
        setColor('');
        setSelectedRole('');
        setStartTime('');
        setGameName('');
        setGameDuration('');
        setAssignments([...assignments, response.data]);
      } else {
        console.error('Failed to create assignment:', response.statusText);
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
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Game Name"
            fullWidth
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Game Duration (minutes)"
            type="number"
            fullWidth
            value={gameDuration}
            onChange={(e) => setGameDuration(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddAssignment} sx={{ mt: 2 }}>
            Add Assignment
          </Button>
        </Box>
      </Modal>

      {/* Display List of Assignments */}
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
                    primary={`Bracelet ID: ${assignment.braceletId}, Color: ${assignment.color}, Game: ${assignment.gameName}`}
                    secondary={`Role: ${assignment.role.name}, Start Time: ${assignment.startTime}, Duration: ${assignment.gameDuration} minutes`}
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
