import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, 
  CircularProgress, Stack, FormHelperText, Grid, Card, CardContent, CardHeader, Divider,
  IconButton, Chip, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon, 
  CalendarMonth, 
  AccessTime,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';

const UpdateAssignmentModal = ({ open, onClose, assignment, onUpdate }) => {
  const [role, setRole] = useState(assignment?.role || '');
  const [braceletId, setBraceletId] = useState(assignment?.braceletId || '');
  const [color, setColor] = useState(assignment?.color || '');
  const [name, setName] = useState(assignment?.name || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accessPeriodToDelete, setAccessPeriodToDelete] = useState(null);

  // State for managing multiple access periods
  const [accessPeriods, setAccessPeriods] = useState([]);

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

  useEffect(() => {
    if (assignment) {
      setRole(assignment.role || '');
      setBraceletId(assignment.braceletId || '');
      setColor(assignment.color || '');
      setName(assignment.name || '');
      
      // Initialize access periods from assignment data
      if (assignment.access_periods && assignment.access_periods.length > 0) {
        setAccessPeriods(
          assignment.access_periods.map(period => ({
            id: period.id,
            access_type: period.access_type,
            startTime: period.startTime ? new Date(period.startTime) : null,
            endTime: period.endTime ? new Date(period.endTime) : null
          }))
        );
      } else {
        // Default to one empty access period if none exists
        setAccessPeriods([{ access_type: '', startTime: null, endTime: null }]);
      }
    }
  }, [assignment]);

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

  const openDeleteDialog = (index) => {
    setAccessPeriodToDelete(index);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAccessPeriodToDelete(null);
  };

  const handleRemoveAccessPeriod = () => {
    if (accessPeriods.length > 1 && accessPeriodToDelete !== null) {
      const newPeriods = [...accessPeriods];
      newPeriods.splice(accessPeriodToDelete, 1);
      setAccessPeriods(newPeriods);
      closeDeleteDialog();
    }
  };

  const handleAccessPeriodChange = (index, field, value) => {
    const newPeriods = [...accessPeriods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setAccessPeriods(newPeriods);
  };

  const handleUpdateAssignment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Filter out incomplete access periods
      const validAccessPeriods = accessPeriods.filter(
        period => period.access_type && period.startTime && period.endTime
      );

      const updatedAssignment = {
        braceletId,
        color,
        name,
        role,
        access_periods: validAccessPeriods,
        access_periods_action: 'replace' // This tells the backend to replace all existing periods
      };
      
      const response = await axiosInstance.put(`/assignment/update/${assignment.id}/`, updatedAssignment);
      
      // Call onUpdate with the expected data structure
      onUpdate({
        assignment: response.data
      });
      
      // Modal will be closed by the parent component in handleUpdateComplete
    } catch (error) {
      console.error('Error updating assignment:', error);
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

  const formatAccessType = (type) => {
    const option = ACCESS_CHOICES.find(choice => choice.value === type);
    return option ? option.label : type;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="update-assignment-modal"
        aria-describedby="modal-to-update-assignment"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          bgcolor: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          borderRadius: 2,
          overflow: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f5f5f5'
          }}>
            <Typography variant="h5" fontWeight="600" color="#0B1929">
              Update Assignment
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: '#B30000' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 3 }}>
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

            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
                          label={`Access Period ${index + 1}`}
                          sx={{ 
                            bgcolor: 'rgba(179, 0, 0, 0.1)', 
                            color: '#B30000', 
                            fontWeight: 500,
                            borderColor: 'rgba(179, 0, 0, 0.3)'
                          }} 
                          variant="outlined" 
                        />
                        
                        <Tooltip title="Delete Access Period">
                          <span>
                            <Button
                              onClick={() => openDeleteDialog(index)}
                              disabled={accessPeriods.length <= 1}
                              startIcon={<DeleteForeverIcon />}
                              variant="outlined"
                              color="error"
                              size="small"
                              sx={{
                                borderColor: accessPeriods.length <= 1 ? 'grey.400' : 'error.main',
                                color: accessPeriods.length <= 1 ? 'grey.500' : 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                  borderColor: 'error.main',
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </span>
                        </Tooltip>
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                onClick={onClose}
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
                onClick={handleUpdateAssignment}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Assignment'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation Dialog for Deleting Access Period */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ bgcolor: '#f5f5f5', color: '#B30000' }}>
          Delete Access Period
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {accessPeriodToDelete !== null && accessPeriods[accessPeriodToDelete] && (
              <>
                Are you sure you want to delete this access period?
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(179, 0, 0, 0.05)', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Access Type:</strong> {formatAccessType(accessPeriods[accessPeriodToDelete].access_type)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Start Time:</strong> {formatDate(accessPeriods[accessPeriodToDelete].startTime)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>End Time:</strong> {formatDate(accessPeriods[accessPeriodToDelete].endTime)}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleRemoveAccessPeriod} 
            variant="contained"
            sx={{ 
              bgcolor: '#B30000',
              '&:hover': {
                bgcolor: '#8B0000'
              }
            }}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateAssignmentModal;
