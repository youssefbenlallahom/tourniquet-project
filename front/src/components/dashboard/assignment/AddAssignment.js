import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const AddAssignment = () => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleAddAssignment = async () => {
    setLoading(true);
    const newAssignment = {
      role: selectedRole,
      braceletId,
      color,
      name,
      access_ids: associations.map(({ accessId }) => accessId),
      timezone_ids: associations.map(({ timezoneId }) => timezoneId),
    };

    try {
      const assignmentResponse = await axiosInstance.post('/assignment/create/', newAssignment);
      if (assignmentResponse.status === 201) {
        console.log('Assignment created successfully:', assignmentResponse.data);
        navigate('/dashboard/assignment');
      } else {
        console.error('Failed to create assignment:', assignmentResponse.statusText);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssociation = () => {
    if (selectedAccess && selectedTimezone) {
      setAssociations([...associations, { accessId: selectedAccess, timezoneId: selectedTimezone }]);
      setSelectedAccess('');
      setSelectedTimezone('');
    }
  };

  const handleRemoveAssociation = (accessId, timezoneId) => {
    setAssociations(associations.filter(assoc => assoc.accessId !== accessId || assoc.timezoneId !== timezoneId));
  };

  // Helper function to format date and time
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <Layout>
      <Box p={4}>
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
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.roleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mr: 2 }}>
            <InputLabel>Access</InputLabel>
            <Select
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

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAssociation}
              disabled={!selectedAccess || !selectedTimezone}
            >
              Add Association
            </Button>
          </Box>

          <FormControl fullWidth sx={{ ml: 2 }}>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {timezones.map((timezone) => (
                <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                  {formatDateTime(timezone.startTime)} - {formatDateTime(timezone.endTime)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" flexDirection="column" sx={{ mb: 4 }}>
          {associations.length > 0 && (
            <Box
              sx={{
                padding: 2,
                border: '1px solid #ccc',
                borderRadius: 2,
                minWidth: 300,
              }}
            >
              <Typography variant="h6">Current Associations</Typography>
              {associations.map(({ accessId, timezoneId }) => {
                const access = accesses.find((a) => a.id === accessId);
                const timezone = timezones.find((t) => t.TimezoneId === timezoneId);
                return (
                  <Box key={`${accessId}-${timezoneId}`} sx={{ mb: 1 }}>
                    <Typography>
                      {access?.GameName} → {formatDateTime(timezone?.startTime)} - {formatDateTime(timezone?.endTime)}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveAssociation(accessId, timezoneId)}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddAssignment}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Adding Assignment...' : 'Add Assignment'}
        </Button>
      </Box>
    </Layout>
  );
};

export default AddAssignment;
