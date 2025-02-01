import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Stack
} from '@mui/material';
import axiosInstance from '../../../axiosInstance';

const UpdateAssignmentModal = ({ open, onClose, assignment, onUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [selectedRole, setSelectedRole] = useState(assignment.role?.id || '');
  const [selectedAccess, setSelectedAccess] = useState(assignment.access_ids || []);
  const [selectedTimezone, setSelectedTimezone] = useState(assignment.timezone_ids || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesResponse, accessesResponse, timezonesResponse] = await Promise.all([
          axiosInstance.get('/role/all/'),
          axiosInstance.get('/access/all/'),
          axiosInstance.get('/timezone/all/')
        ]);
        setRoles(rolesResponse.data);
        setAccesses(accessesResponse.data);
        setTimezones(timezonesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleUpdateAssignment = async () => {
    setLoading(true);
    try {
      const updatedAssignment = {
        id: assignment.id,
        role: selectedRole,
        access_ids: selectedAccess,
        timezone_ids: selectedTimezone,
      };
      const response = await axiosInstance.put(`/assignment/update/${assignment.id}/`, updatedAssignment);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="update-assignment-modal" aria-describedby="modal-to-update-assignment">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Update Assignment
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Access</InputLabel>
            <Select
              multiple
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
            >
              {accesses.map((access) => (
                <MenuItem key={access.id} value={access.id}>
                  {access.GameName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              multiple
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {timezones.map((timezone) => (
                <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                  {`${new Date(timezone.startTime).toLocaleString()} - ${new Date(timezone.endTime).toLocaleString()}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleUpdateAssignment} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default UpdateAssignmentModal;
