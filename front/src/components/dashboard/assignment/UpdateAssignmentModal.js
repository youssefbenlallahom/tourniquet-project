import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Autocomplete, Modal } from '@mui/material';
import axiosInstance from '../../../axiosInstance';

const UpdateAssignmentModal = ({ open, onClose, assignment, onUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const [updatedAssignment, setUpdatedAssignment] = useState({
    id: assignment.id,
    braceletId: assignment.braceletId,
    color: assignment.color,
    roleId: assignment.role?.id || '',
    accessIds: assignment.access_ids.map(access => access.id) || [],
    timezoneIds: assignment.timezone_ids.map(timezone => timezone.id) || []
  });

  useEffect(() => {
    const fetchRolesAndAccesses = async () => {
      try {
        const rolesResponse = await axiosInstance.get('/roles/all/');
        const accessesResponse = await axiosInstance.get('/access/all/');
        setRoles(rolesResponse.data);
        setAccesses(accessesResponse.data);
      } catch (error) {
        console.error('Error fetching roles or accesses:', error);
      }
    };

    fetchRolesAndAccesses();
  }, []);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const timezonesResponse = await axiosInstance.get('/timezone/all/');
        setTimezones(timezonesResponse.data);
      } catch (error) {
        console.error('Error fetching timezones:', error);
      }
    };

    fetchTimezones();
  }, []);

  useEffect(() => {
    const filtered = timezones.filter((timezone) =>
      updatedAssignment.accessIds.includes(timezone.accessId)
    );
    setFilteredTimezones(filtered);
  }, [updatedAssignment.accessIds, timezones]);

  const handleInputChange = (field, value) => {
    setUpdatedAssignment({
      ...updatedAssignment,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.put(`/assignment/update/${assignment.id}/`, {
        braceletId: updatedAssignment.braceletId,
        color: updatedAssignment.color,
        roleId: updatedAssignment.roleId,
        accessIds: updatedAssignment.accessIds,
        timezoneIds: updatedAssignment.timezoneIds
      });
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment. Please check the console for details.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 4, backgroundColor: 'white', borderRadius: 2, maxWidth: 500, margin: 'auto', mt: '10%' }}>
        <Typography variant="h6" mb={2}>Update Assignment</Typography>
        <TextField
          label="Bracelet ID"
          fullWidth
          value={updatedAssignment.braceletId}
          onChange={(e) => handleInputChange('braceletId', e.target.value)}
          margin="normal"
        />
        <TextField
          label="Color"
          fullWidth
          value={updatedAssignment.color}
          onChange={(e) => handleInputChange('color', e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={updatedAssignment.roleId}
            onChange={(e) => handleInputChange('roleId', e.target.value)}
            label="Role"
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.roleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          multiple
          options={accesses}
          getOptionLabel={(option) => option.GameName}
          value={accesses.filter(access => updatedAssignment.accessIds.includes(access.id))}
          onChange={(event, newValue) => {
            handleInputChange('accessIds', newValue.map(access => access.id));
          }}
          renderInput={(params) => <TextField {...params} label="Access" margin="normal" />}
        />
        <Autocomplete
          multiple
          options={filteredTimezones}
          getOptionLabel={(option) => `${option.startTime} - ${option.endTime}`}
          value={filteredTimezones.filter(timezone => updatedAssignment.timezoneIds.includes(timezone.id))}
          onChange={(event, newValue) => {
            handleInputChange('timezoneIds', newValue.map(timezone => timezone.id));
          }}
          renderInput={(params) => <TextField {...params} label="Timezones" margin="normal" />}
        />
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Update</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateAssignmentModal;
