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
  IconButton,
  Divider,
  Box,
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
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="#1976d2">
          Add Assignment
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3  }}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            color="primary"
            sx={{ maxWidth: '500px' }}  
          />
          <TextField
            label="Bracelet ID"
            fullWidth
            value={braceletId}
            onChange={(e) => setBraceletId(e.target.value)}
            variant="outlined"
            color="primary"
            sx={{ maxWidth: '500px' }}  
          />
          <TextField
            label="Color"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            variant="outlined"
            color="primary"
            sx={{ maxWidth: '500px' }}  
          />
          <FormControl fullWidth sx={{ maxWidth: '500px' }}>  
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

          <Divider />

          <Typography variant="h5" gutterBottom color="#1976d2">
            Add Access and Timezone
          </Typography>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth sx={{ maxWidth: '300px' }}>  
              <InputLabel>Access</InputLabel>
              <Select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                variant="outlined"
                color="primary"
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
              >
                Add
              </Button>
            </FormControl>

            <FormControl fullWidth sx={{ maxWidth: '300px' }}>  
              <InputLabel>Timezone</InputLabel>
              <Select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                variant="outlined"
                color="primary"
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
              >
                Add
              </Button>
            </FormControl>
          </Stack>

          <Divider />

          <Typography variant="h5" gutterBottom color="#1976d2">
            Access and Timezone Associations
          </Typography>
          {accessTimezoneAssociations.length === 0 ? (
            <Typography variant="body1" color="textSecondary">
              No associations added yet.
            </Typography>
          ) : (
            accessTimezoneAssociations.map((association) => (
              <Box key={association.accessId} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary" sx={{ minWidth: '200px' }}>
                  {accesses.find(access => access.id === association.accessId)?.GameName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', maxWidth: '800px' }}>  {/* Flex-wrap pour éviter le débordement */}
                  {association.timezones.map((timezoneId) => (
                    <Chip
                      key={timezoneId}
                      label={formatDateTime(timezones.find(timezone => timezone.TimezoneId === timezoneId).startTime)}
                      onDelete={() => handleRemoveTimezone(association.accessId, timezoneId)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleRemoveAccess(association.accessId)}
                  color="secondary"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAssignment}
              disabled={loading || !braceletId || !color || !name || accessTimezoneAssociations.length === 0}
            >
              {loading ? <CircularProgress size={24} color="secondary" /> : 'Add Assignment'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default AddAssignment;
