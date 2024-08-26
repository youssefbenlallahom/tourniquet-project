import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Autocomplete, Modal } from '@mui/material';
import axiosInstance from '../../../axiosInstance';

const UpdateAssignmentModal = ({ open, onClose, assignment, onUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [updatedAssignment, setUpdatedAssignment] = useState({
    braceletId: '',
    color: '',
    name: '',
    role: '',
    access: '',
    timezone: null,
  });

  useEffect(() => {
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

    fetchRoles();
    fetchAccesses();
    fetchTimezones();
  }, []);

  useEffect(() => {
    if (assignment) {
      setUpdatedAssignment({
        braceletId: assignment.braceletId,
        color: assignment.color,
        name: assignment.name,
        role: assignment.role,
        access: assignment.access,
        timezone: assignment.timezone,
      });
    }
  }, [assignment]);

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.put(`/assignment/update/${assignment.id}/`, updatedAssignment);
      if (response.status === 200) {
        onUpdate(response.data);
        onClose();
      } else {
        console.error('Failed to update assignment:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
          Update Assignment
        </Typography>
        <TextField
          label="Name"
          fullWidth
          value={updatedAssignment.name || ''}
          onChange={(e) => setUpdatedAssignment({ ...updatedAssignment, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Bracelet ID"
          fullWidth
          value={updatedAssignment.braceletId || ''}
          onChange={(e) => setUpdatedAssignment({ ...updatedAssignment, braceletId: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Color"
          fullWidth
          value={updatedAssignment.color || ''}
          onChange={(e) => setUpdatedAssignment({ ...updatedAssignment, color: e.target.value })}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={updatedAssignment.role || ''}
            onChange={(e) => setUpdatedAssignment({ ...updatedAssignment, role: e.target.value })}
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
            value={updatedAssignment.access || ''}
            onChange={(e) => setUpdatedAssignment({ ...updatedAssignment, access: e.target.value })}
          >
            {accesses.map(access => (
              <MenuItem key={access.id} value={access.id}>
                {access.GameName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          value={updatedAssignment.timezone || null}
          onChange={(event, newValue) => {
            setUpdatedAssignment({ ...updatedAssignment, timezone: newValue });
          }}
          options={timezones}
          getOptionLabel={(option) => `Timezone ID: ${option.TimezoneId} - ${new Date(option.startTime).toLocaleString()} to ${new Date(option.endTime).toLocaleString()}`}
          renderInput={(params) => <TextField {...params} label="Timezone" variant="outlined" fullWidth />}
        />
        <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }}>
          Update Assignment
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateAssignmentModal;
