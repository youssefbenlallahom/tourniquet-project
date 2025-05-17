import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Divider,
  FormHelperText,
  Box,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Container,
  Paper
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, CalendarMonth, AccessTime } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const AddAssignment = () => {
  const [braceletId, setBraceletId] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // State for managing multiple access periods
  const [accessPeriods, setAccessPeriods] = useState([
    { access_type: '', startTime: null, endTime: null }
  ]);

  // Access choices from the Django model
  const ACCESS_CHOICES = [
    {value: 'ChillRoom', label: 'ChillRoom'},
    {value: 'GameOn', label: 'GameOn'},
    {value: 'Office', label: 'Office'},
    {value: 'Escape1', label: 'Escape1'},
    {value: 'Escape2', label: 'Escape2'},
    {value: 'Escape3', label: 'Escape3'},
    {value: 'AxeThrowing', label: 'AxeThrowing'},
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!braceletId) newErrors.braceletId = 'Bracelet ID is required';
    if (!name) newErrors.name = 'Name is required';
    if (!role) newErrors.role = 'Role is required';
    
    // Validate all access periods
    const accessErrors = [];
    let hasValidAccess = false;
    
    accessPeriods.forEach((period, index) => {
      const periodErrors = {};
      if (!period.access_type) periodErrors.access_type = 'Access type is required';
      if (!period.startTime) periodErrors.startTime = 'Start Time is required';
      if (!period.endTime) periodErrors.endTime = 'End Time is required';
      
      if (Object.keys(periodErrors).length > 0) {
        accessErrors[index] = periodErrors;
      } else {
        hasValidAccess = true;
      }
    });
    
    if (!hasValidAccess) {
      newErrors.accessPeriods = 'At least one valid access period is required';
    }
    
    if (accessErrors.length > 0) {
      newErrors.accessPeriodsDetails = accessErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccessPeriod = () => {
    setAccessPeriods([...accessPeriods, { access_type: '', startTime: null, endTime: null }]);
  };

  const handleRemoveAccessPeriod = (index) => {
    if (accessPeriods.length > 1) {
      const newPeriods = [...accessPeriods];
      newPeriods.splice(index, 1);
      setAccessPeriods(newPeriods);
    }
  };

  const handleAccessPeriodChange = (index, field, value) => {
    const newPeriods = [...accessPeriods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setAccessPeriods(newPeriods);
  };

  const handleAddAssignment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Filter out incomplete access periods
    const validAccessPeriods = accessPeriods.filter(
      period => period.access_type && period.startTime && period.endTime
    );

    const newAssignment = {
      braceletId,
      color,
      name,
      role,
      access_periods: validAccessPeriods
    };

    try {
      const response = await axiosInstance.post('/assignment/create/', newAssignment);
      if (response.status === 201) {
        navigate('/dashboard/assignment');
      } else {
        console.error('Failed to create assignment:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      // Display API errors
      if (error.response && error.response.data) {
        setErrors({
          ...errors,
          api: typeof error.response.data === 'string' 
            ? error.response.data
            : Object.values(error.response.data).flat().join(', ')
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ pb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/dashboard/assignment')}
            sx={{ mr: 2, color: '#B30000' }}
          >
            Back to Assignments
          </Button>
          <Typography variant="h4" fontWeight="600" color="#0B1929">
            Add New Assignment
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />

        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'white',
            mb: 4
          }}
        >
          {errors.api && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(179, 0, 0, 0.1)', borderRadius: 1 }}>
              <Typography color="error" variant="body2">
                {errors.api}
              </Typography>
            </Box>
          )}

          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardHeader 
              title="Personal Information" 
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#0B1929'
                }
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#B30000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#B30000',
                      },
                    }}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bracelet ID"
                    fullWidth
                    value={braceletId}
                    onChange={(e) => setBraceletId(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#B30000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#B30000',
                      },
                    }}
                    error={!!errors.braceletId}
                    helperText={errors.braceletId}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Color"
                    fullWidth
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#B30000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#B30000',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Role"
                    fullWidth
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#B30000',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#B30000',
                      },
                    }}
                    error={!!errors.role}
                    helperText={errors.role}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardHeader 
              title="Access Periods" 
              sx={{ 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0',
                '& .MuiCardHeader-title': {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#0B1929'
                }
              }}
              action={
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddAccessPeriod}
                  variant="contained"
                  sx={{ 
                    bgcolor: '#B30000',
                    '&:hover': {
                      bgcolor: '#8B0000'
                    }
                  }}
                  size="small"
                >
                  Add Access
                </Button>
              }
            />
            <CardContent sx={{ p: 3 }}>
              {errors.accessPeriods && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.accessPeriods}
                </Typography>
              )}
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {accessPeriods.map((period, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 3, 
                      p: 3, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      position: 'relative',
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Chip 
                        label={`Access ${index + 1}`} 
                        sx={{ 
                          bgcolor: 'rgba(179, 0, 0, 0.1)', 
                          color: '#B30000', 
                          fontWeight: 500,
                          borderColor: 'rgba(179, 0, 0, 0.3)'
                        }} 
                        variant="outlined" 
                        size="small" 
                      />
                      {accessPeriods.length > 1 && (
                        <IconButton
                          onClick={() => handleRemoveAccessPeriod(index)}
                          disabled={accessPeriods.length <= 1}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            color: accessPeriods.length <= 1 ? 'grey.400' : '#B30000',
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            '&:hover': {
                              bgcolor: accessPeriods.length <= 1 ? 'white' : 'rgba(179, 0, 0, 0.1)',
                            }
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl 
                          fullWidth 
                          error={!!errors.accessPeriodsDetails?.[index]?.access_type}
                        >
                          <InputLabel>Access Type</InputLabel>
                          <Select
                            value={period.access_type}
                            onChange={(e) => handleAccessPeriodChange(index, 'access_type', e.target.value)}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.accessPeriodsDetails?.[index]?.access_type ? 'error.main' : '#e0e0e0',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#B30000',
                              },
                            }}
                          >
                            {ACCESS_CHOICES.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.accessPeriodsDetails?.[index]?.access_type && (
                            <FormHelperText>{errors.accessPeriodsDetails[index].access_type}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <DateTimePicker
                          label="Start Time"
                          value={period.startTime}
                          onChange={(value) => handleAccessPeriodChange(index, 'startTime', value)}
                          renderInput={(props) => (
                            <TextField 
                              {...props}
                              fullWidth
                              error={!!errors.accessPeriodsDetails?.[index]?.startTime}
                              helperText={errors.accessPeriodsDetails?.[index]?.startTime || props.helperText}
                              InputProps={{
                                ...props.InputProps,
                                startAdornment: <CalendarMonth sx={{ mr: 1, color: '#B30000', opacity: 0.7 }} />
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#B30000',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#B30000',
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <DateTimePicker
                          label="End Time"
                          value={period.endTime}
                          onChange={(value) => handleAccessPeriodChange(index, 'endTime', value)}
                          renderInput={(props) => (
                            <TextField 
                              {...props}
                              fullWidth
                              error={!!errors.accessPeriodsDetails?.[index]?.endTime}
                              helperText={errors.accessPeriodsDetails?.[index]?.endTime || props.helperText}
                              InputProps={{
                                ...props.InputProps,
                                startAdornment: <AccessTime sx={{ mr: 1, color: '#B30000', opacity: 0.7 }} />
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#B30000',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#B30000',
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </LocalizationProvider>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/assignment')}
              sx={{ 
                mr: 2, 
                borderColor: '#0B1929',
                color: '#0B1929',
                '&:hover': {
                  borderColor: '#0B1929',
                  bgcolor: 'rgba(11, 25, 41, 0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddAssignment}
              disabled={loading}
              sx={{ 
                bgcolor: '#B30000',
                '&:hover': {
                  bgcolor: '#8B0000'
                },
                minWidth: '150px',
                boxShadow: '0 4px 8px rgba(179, 0, 0, 0.2)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Assignment'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default AddAssignment;
