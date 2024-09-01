import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const AddAssignment = () => {
  const [roles, setRoles] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [accessTimezoneAssociations, setAccessTimezoneAssociations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

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
        setFilteredTimezones(response.data);
      } catch (error) {
        console.error('Error fetching timezones:', error);
      }
    };

    fetchRoles();
    fetchAccesses();
    fetchTimezones();
  }, []);

  useEffect(() => {
    if (selectedAccess) {
      const selectedAccessId = parseInt(selectedAccess, 10);
      const relatedTimezones = timezones.filter((timezone) => {
        const accessIds = timezone.access.map(a => a.id);
        return accessIds.includes(selectedAccessId);
      });
      setFilteredTimezones(relatedTimezones);
    } else {
      setFilteredTimezones(timezones);
    }
  }, [selectedAccess, timezones]);

  const handleAddAccess = () => {
    if (selectedAccess && !accessTimezoneAssociations.some(association => association.accessId === parseInt(selectedAccess, 10))) {
      setAccessTimezoneAssociations([...accessTimezoneAssociations, {
        accessId: parseInt(selectedAccess, 10),
        timezones: []
      }]);
      setSelectedAccess('');
    }
  };

  const handleRemoveAccess = (accessId) => {
    setAccessTimezoneAssociations(accessTimezoneAssociations.filter(association => association.accessId !== accessId));
  };

  const handleAddTimezone = () => {
    if (selectedTimezone && accessTimezoneAssociations.length > 0) {
      const updatedAssociations = accessTimezoneAssociations.map(association => {
        if (association.accessId === parseInt(selectedAccess, 10)) {
          return {
            ...association,
            timezones: [...association.timezones, parseInt(selectedTimezone, 10)]
          };
        }
        return association;
      });
      setAccessTimezoneAssociations(updatedAssociations);
      setSelectedTimezone('');
    }
  };

  const handleRemoveTimezone = (accessId, timezoneId) => {
    const updatedAssociations = accessTimezoneAssociations.map(association => {
      if (association.accessId === accessId) {
        return {
          ...association,
          timezones: association.timezones.filter(id => id !== timezoneId)
        };
      }
      return association;
    });
    setAccessTimezoneAssociations(updatedAssociations);
  };

  const handleAddAssignment = async () => {
    setLoading(true);

    const newAssignment = {
      role: selectedRole || null,
      braceletId,
      color,
      name,
      access_ids: accessTimezoneAssociations.map(association => association.accessId),
      timezone_ids: accessTimezoneAssociations.flatMap(association => association.timezones)
    };

    try {
      const assignmentResponse = await axiosInstance.post('/assignment/create/', newAssignment);
      if (assignmentResponse.status === 201) {
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

  return (
    <Layout>
      <Typography variant="h5" gutterBottom color="#1976d2" sx={{ p: 4 }}>
        Add Assignment
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <TextField
        label="Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
        variant="outlined"
        color="primary"
      />
      <TextField
        label="Bracelet ID"
        fullWidth
        value={braceletId}
        onChange={(e) => setBraceletId(e.target.value)}
        sx={{ mb: 2 }}
        variant="outlined"
        color="primary"
      />
      <TextField
        label="Color"
        fullWidth
        value={color}
        onChange={(e) => setColor(e.target.value)}
        sx={{ mb: 2 }}
        variant="outlined"
        color="primary"
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          variant="outlined"
          color="primary"
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.roleName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" gutterBottom color="#1976d2" sx={{ mb: 2 }}>
        Add Access and Timezone
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} >
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>Access</InputLabel>
          <Select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            variant="outlined"
            color="primary"
            size="small"
          >
            {accesses.map((access) => (
              <MenuItem key={access.id} value={access.id}>
                {access.GameName}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAccess}
            sx={{ mt: 1 }}
            disabled={!selectedAccess}
            size="small"
          >
            Add
          </Button>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            variant="outlined"
            color="primary"
            size="small"
            disabled={!selectedAccess}
          >
            {filteredTimezones.map((timezone) => (
              <MenuItem key={timezone.TimezoneId} value={timezone.TimezoneId}>
                {formatDateTime(timezone.startTime)} - {formatDateTime(timezone.endTime)}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTimezone}
            sx={{ mt: 1 }}
            disabled={!selectedTimezone}
            size="small"
          >
            Add
          </Button>
        </FormControl>
      </Stack>

      <Typography variant="h6" gutterBottom color="#1976d2" sx={{ mb: 2 }}>
        Access and Timezone Associations
      </Typography>
      {accessTimezoneAssociations.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No access and timezone associations added yet.
        </Typography>
      ) : (
        accessTimezoneAssociations.map(association => (
          <Stack key={association.accessId} mb={2} p={2} bgcolor="#f0f0f0" borderRadius="4px">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body1" fontWeight="bold">
                Access {association.accessId}
              </Typography>
              <IconButton
                color="error"
                onClick={() => handleRemoveAccess(association.accessId)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              {association.timezones.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No timezones added.
                </Typography>
              ) : (
                association.timezones.map(timezoneId => {
                  const timezone = timezones.find(tz => tz.TimezoneId === timezoneId);
                  return timezone ? (
                    <Chip
                      key={timezone.TimezoneId}
                      label={`${formatDateTime(timezone.startTime)} - ${formatDateTime(timezone.endTime)}`}
                      onDelete={() => handleRemoveTimezone(association.accessId, timezone.TimezoneId)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ) : null;
                })
              )}
            </Stack>
          </Stack>
        ))
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddAssignment}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Add Assignment'}
      </Button>
    </Layout>
  );
};

export default AddAssignment;
