import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Divider
} from '@mui/material';
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
      role: selectedRole,
      braceletId,
      color,
      name,
      access_timezone_associations: accessTimezoneAssociations.map(association => ({
        access_id: association.accessId,
        timezone_ids: association.timezones
      }))
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
      <Box p={4} bgcolor="#f5f5f5" borderRadius="8px" boxShadow={3}>
        <Typography variant="h5" gutterBottom color="#fffff">
          Add Assignment
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            label="Bracelet ID"
            fullWidth
            value={braceletId}
            onChange={(e) => setBraceletId(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            label="Color"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              variant="outlined"
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" flexDirection="column" sx={{ mb: 4 }}>
            <Box display="flex" mb={2}>
              <FormControl fullWidth sx={{ mr: 2 }}>
                <InputLabel>Access</InputLabel>
                <Select
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                  variant="outlined"
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
                  sx={{ mt: 2 }}
                  disabled={!selectedAccess}
                >
                  Add Access
                </Button>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  variant="outlined"
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
                  sx={{ mt: 2 }}
                  disabled={!selectedTimezone}
                >
                  Add Timezone
                </Button>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="#1976d2">
                Access and Timezone Associations
              </Typography>
              {accessTimezoneAssociations.map(association => (
                <Box key={association.accessId} mb={2} p={2} bgcolor="#fff" borderRadius="4px" boxShadow={1}>
                  <Box mb={1}>
                    <Chip
                      label={`Access: ${accesses.find(a => a.id === association.accessId)?.GameName || 'Unknown'}`}
                      sx={{ backgroundColor: '#1976d2', color: '#fff' }} // Placeholder color
                    />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {association.timezones.map(timezoneId => {
                      const timezone = timezones.find(tz => tz.TimezoneId === timezoneId);
                      return (
                        <Chip
                          key={timezoneId}
                          label={timezone ? `${formatDateTime(timezone.startTime)} - ${formatDateTime(timezone.endTime)}` : 'Unknown'}
                          onDelete={() => handleRemoveTimezone(association.accessId, timezoneId)}
                        />
                      );
                    })}
                  </Stack>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveAccess(association.accessId)}
                    sx={{ mt: 2 }}
                  >
                    Remove Access
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" mt={4}>
  <Button
    variant="contained"
    color="primary"
    onClick={handleAddAssignment}
    disabled={loading}
    sx={{
      width: '200px', // Ajuste la largeur du bouton
      height: '50px', // Ajuste la hauteur du bouton
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px', // Ajuste la taille du texte
    }}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
  </Button>
</Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default AddAssignment;
