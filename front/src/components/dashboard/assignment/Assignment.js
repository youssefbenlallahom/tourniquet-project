import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, Tooltip, Typography, Chip, Stack, Collapse, Grid, CircularProgress, Alert, Divider, Modal
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Sync as SyncIcon,
  Close as CloseIcon,
  Terminal as TerminalIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import UpdateAssignmentModal from './UpdateAssignmentModal';
import CommandOutput from './CommandOutput';
import * as signalR from '@microsoft/signalr';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandOutput, setCommandOutput] = useState(null);
  const [commandStatus, setCommandStatus] = useState(null);
  const [showCommandOutput, setShowCommandOutput] = useState(false);
  const [commandType, setCommandType] = useState('');

  const navigate = useNavigate();
  
  const executeCommandAssignment = async () => {
    try {
      setCommandLoading(true);
      setShowCommandOutput(true);
      setCommandType('sync');
      // Add the command parameter to the request body
      const response = await axiosInstance.post('/assignment/execute-command-assignment/');
      
      // Set the output and status for the CommandOutput component
      setCommandOutput(response.data.output);
      setCommandStatus(response.data.status);
    } catch (error) {
      console.error('Error executing command:', error);
      setError('Error executing command. Please try again later.');
      setCommandStatus('error');
      if (error.response && error.response.data) {
        setCommandOutput(error.response.data.output || 'An error occurred while executing the command.');
      } else {
        setCommandOutput('An error occurred while executing the command.');
      }
    } finally {
      setCommandLoading(false);
    }
  };
  
  // Reference for SignalR connection
  const signalRConnection = useRef(null);
  const [isLogging, setIsLogging] = useState(false);
  
  const stopRealTimeLogs = async () => {
    try {
      setCommandLoading(true);
      
      // Close SignalR connection if open
      if (signalRConnection.current) {
        await signalRConnection.current.stop();
        signalRConnection.current = null;
      }
      
      // Call backend to stop the ZKTeco server
      const response = await axiosInstance.get('/assignment/stop-rt-log/');
      
      const timestamp = new Date().toLocaleTimeString();
      setCommandOutput(prev => 
        prev + 
        '\n\n' + 
        `[${timestamp}] [System] Log server stopped. Connection terminated.` +
        '\n' +
        '[System] To restart logs, press the Log button again.'
      );
      setCommandStatus('success');
      setIsLogging(false);
      setCommandLoading(false);
      console.log("Stopped ZKTeco server:", response.data);
    } catch (err) {
      console.error("Error stopping ZKTeco server:", err);
      setError(`Error stopping log server: ${err.message}`);
      setCommandStatus('error');
      setCommandLoading(false);
    }
  };
  
  const getRealTimeLogs = async () => {
    setCommandLoading(true);
    setShowCommandOutput(true);
    setCommandType('log');
    setCommandOutput('Starting real-time log session...');
    setCommandStatus('success');
    setIsLogging(true);
    
    // First, make sure the ZKTeco server is running by calling our backend
    try {
      const serverResponse = await axiosInstance.get('/assignment/get-all-rt-log/');
      console.log("ZKTeco server response:", serverResponse.data);
      
      // Close existing connection if any
      if (signalRConnection.current) {
        await signalRConnection.current.stop();
        console.log("Closed existing SignalR connection");
      }
      
      // Create new SignalR connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5125/logHub", {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      
      // Connection state change handler
      connection.onclose(error => {
        console.log("SignalR connection closed", error);
        if (error) {
          setCommandOutput(prev => prev + "\n[Connection closed] " + error.message);
          setError("Connection to log server lost");
        }
      });
      
      // Set up event handler for receiving log messages
      connection.on("ReceiveLog", (logData) => {
        console.log("Received log data:", logData);
        
        // Format the log message properly from the object
        let formattedLog;
        
        if (typeof logData === 'object' && logData !== null) {
          // The LogBroadcaster sends an object with ip and message properties
          if (logData.ip && logData.message) {
            formattedLog = `[${new Date().toLocaleTimeString()}] [${logData.ip}] ${logData.message}`;
          } else {
            // Fallback to JSON stringify for other objects
            formattedLog = JSON.stringify(logData, null, 2);
          }
        } else {
          formattedLog = String(logData); // Convert to string for any other type
        }
        
        setCommandOutput(prev => (prev ? prev + '\n' : '') + formattedLog);
        setCommandStatus('success');
        setCommandLoading(false);
        setIsLogging(true); // Ensure logging state is active when receiving messages
      });
      
      // Start the connection
      setCommandOutput(prev => prev + "\nConnecting to log server...");
      await connection.start();
      signalRConnection.current = connection;
      
      setCommandOutput(prev => prev + "\nConnected to log server! Waiting for events...");
      console.log("SignalR connected to logHub");
    } catch (err) {
      console.error("Error connecting to SignalR hub:", err);
      setError(`Error connecting to log server: ${err.message}`);
      setCommandOutput(prev => prev + `\n[ERROR] ${err.message}`);
      setCommandStatus('error');
      setCommandLoading(false);
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/assignment/all/');
        if (Array.isArray(response.data)) {
          setAssignments(response.data);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('Failed to fetch assignments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
    
    // Cleanup function to stop SignalR connection and ZKTeco server when component unmounts
    return () => {
      if (signalRConnection.current) {
        signalRConnection.current.stop();
      }
      
      // Also stop the server process when unmounting
      if (isLogging) {
        axiosInstance.get('/assignment/stop-rt-log/')
          .then(() => console.log("ZKTeco server stopped on unmount"))
          .catch(err => console.error("Failed to stop ZKTeco server on unmount:", err));
      }
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axiosInstance.delete(`/assignment/delete/${id}/`);
        setAssignments(assignments.filter(assignment => assignment.id !== id));
      } catch (error) {
        console.error('Error deleting assignment:', error);
        setError('Failed to delete assignment. Please try again later.');
      }
    }
  };

  const handleUpdate = (assignment) => {
    setSelectedAssignment(assignment);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateComplete = (updatedAssignment) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    ));
    setIsUpdateModalOpen(false);
    setSelectedAssignment(null);
  };

  const toggleExpandRow = (id) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) return 'Invalid Date'; // Handle invalid date
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(parsedDate);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getColorForAccessType = (accessType) => {
    const colorMap = {
      'ChillRoom': '#B30000',
      'GameOn': '#990000',
      'Office': '#740000',
      'Escape1': '#880000',
      'Escape2': '#A00000',
      'Escape3': '#660000',
      'AxeThrowing': '#8B0000'
    };
    return colorMap[accessType] || '#333333';
  };

  return (
    <Layout>
      <Box 
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        p={3}
        sx={{ maxWidth: '1400px', mx: 'auto' }}
      >
        <motion.div variants={itemVariants}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            sx={{
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              pb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon 
                sx={{ 
                  fontSize: 32, 
                  mr: 2, 
                  color: '#B30000',
                  bgcolor: 'rgba(179, 0, 0, 0.1)',
                  p: 1,
                  borderRadius: '50%'
                }} 
              />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' }
                }}
              >
                Assignment Management
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    ml: { xs: 0, sm: 2 },
                    color: 'text.secondary',
                    fontWeight: 'normal'
                  }}
                >
                  Manage all access assignments and bracelet configurations
                </Typography>
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={executeCommandAssignment}
                sx={{ 
                  borderColor: '#0B1929',
                  color: '#0B1929',
                  '&:hover': {
                    borderColor: '#0B1929',
                    bgcolor: 'rgba(11, 25, 41, 0.05)',
                  }
                }}
              >
                Sync
              </Button>
              <Button 
                variant="outlined"
                startIcon={<TerminalIcon />}
                onClick={getRealTimeLogs}
                disabled={isLogging}
                sx={{ 
                  borderColor: '#0B1929',
                  color: '#0B1929',
                  '&:hover': {
                    borderColor: '#0B1929',
                    bgcolor: 'rgba(11, 25, 41, 0.05)',
                  }
                }}
              >
                Log
              </Button>
              {isLogging && (
                <Button 
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={stopRealTimeLogs}
                  sx={{ 
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': {
                      borderColor: '#b71c1c',
                      bgcolor: 'rgba(211, 47, 47, 0.05)',
                    }
                  }}
                >
                  Stop
                </Button>
              )}
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/dashboard/assignment/new')}
                sx={{ 
                  bgcolor: '#B30000',
                  '&:hover': {
                    bgcolor: '#8B0000'
                  },
                  boxShadow: '0 4px 8px rgba(179, 0, 0, 0.2)',
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
              >
                Add Assignment
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          </motion.div>
        )}
        
        {/* Command Output Display */}
        {showCommandOutput && (
          <motion.div variants={itemVariants}>
            <CommandOutput 
              output={commandOutput} 
              status={commandStatus} 
              loading={commandLoading}
              commandType={commandType}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
                <CircularProgress sx={{ color: '#B30000' }} />
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
                <Table aria-label="assignment table" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          width: '50px', 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none'
                        }} 
                      />
                      <TableCell 
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Bracelet ID
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Color
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Role
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Access
                      </TableCell>
                      <TableCell 
                        align="center"
                        sx={{ 
                          bgcolor: '#0B1929',
                          color: 'white',
                          border: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment, index) => (
                      <React.Fragment key={assignment.id}>
                        <TableRow 
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                            },
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'rgba(179, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpandRow(assignment.id)}
                              sx={{ 
                                color: '#B30000',
                                '&:hover': { 
                                  bgcolor: 'rgba(179, 0, 0, 0.1)' 
                                } 
                              }}
                            >
                              {expandedRows[assignment.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ fontWeight: '500' }}>{assignment.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.braceletId} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(179, 0, 0, 0.1)', 
                                color: '#B30000',
                                fontWeight: 'bold' 
                              }}
                            />
                          </TableCell>
                          <TableCell>{assignment.color}</TableCell>
                          <TableCell>{assignment.role}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {assignment.access_periods && assignment.access_periods.length > 0 ? (
                                assignment.access_periods.slice(0, 2).map((period, index) => (
                                  <Chip 
                                    key={index} 
                                    label={period.access_type} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: getColorForAccessType(period.access_type),
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: '24px'
                                    }}
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No access defined
                                </Typography>
                              )}
                              {assignment.access_periods && assignment.access_periods.length > 2 && (
                                <Chip 
                                  label={`+${assignment.access_periods.length - 2}`}
                                  size="small" 
                                  variant="outlined"
                                  sx={{ 
                                    borderColor: '#B30000', 
                                    color: '#B30000',
                                    height: '24px'
                                  }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit">
                              <IconButton 
                                onClick={() => handleUpdate(assignment)} 
                                sx={{ 
                                  color: '#0B1929',
                                  '&:hover': { 
                                    bgcolor: 'rgba(11, 25, 41, 0.1)' 
                                  } 
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => handleDelete(assignment.id)} 
                                sx={{ 
                                  color: '#B30000',
                                  '&:hover': { 
                                    bgcolor: 'rgba(179, 0, 0, 0.1)' 
                                  } 
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded row with access period details */}
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                            <Collapse in={expandedRows[assignment.id]} timeout="auto" unmountOnExit>
                              <Box 
                                sx={{ 
                                  margin: 2, 
                                  padding: 3, 
                                  borderRadius: 2,
                                  bgcolor: '#f8f8f8',
                                  border: '1px solid rgba(0,0,0,0.05)'
                                }}
                              >
                                <Typography 
                                  variant="subtitle1" 
                                  gutterBottom 
                                  component="div"
                                  sx={{ 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#0B1929'
                                  }}
                                >
                                  <span 
                                    style={{ 
                                      width: 4, 
                                      height: 16, 
                                      background: '#B30000', 
                                      display: 'inline-block',
                                      marginRight: 8,
                                      borderRadius: 2
                                    }}
                                  ></span>
                                  Access Periods for {assignment.name}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {assignment.access_periods && assignment.access_periods.length > 0 ? (
                                  <Grid container spacing={2}>
                                    {assignment.access_periods.map((period, index) => (
                                      <Grid item xs={12} md={6} lg={4} key={index}>
                                        <Box 
                                          sx={{ 
                                            border: '1px solid #e0e0e0', 
                                            borderRadius: 2, 
                                            p: 2,
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                              transform: 'translateY(-2px)',
                                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                            }
                                          }}
                                        >
                                          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <Chip 
                                              label={period.access_type} 
                                              sx={{ 
                                                bgcolor: getColorForAccessType(period.access_type),
                                                color: 'white',
                                                fontWeight: 'bold'
                                              }}
                                            />
                                          </Stack>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            mb: 1 
                                          }}>
                                            <Typography variant="body2" color="text.secondary">
                                              Start Time
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                              {formatDate(period.startTime)}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                              End Time
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                              {formatDate(period.endTime)}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No access periods defined for this assignment.
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {assignments.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Box 
                            sx={{ 
                              textAlign: 'center', 
                              py: 5,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <AssignmentIcon 
                              sx={{ 
                                fontSize: 60, 
                                color: 'rgba(0,0,0,0.2)', 
                                mb: 2 
                              }} 
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No Assignments Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Get started by creating your first assignment
                            </Typography>
                            <Button 
                              variant="contained" 
                              startIcon={<AddIcon />}
                              onClick={() => navigate('/dashboard/assignment/new')}
                              sx={{ 
                                bgcolor: '#B30000',
                                '&:hover': {
                                  bgcolor: '#8B0000'
                                }
                              }}
                            >
                              Add Assignment
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </motion.div>
      </Box>

      {selectedAssignment && (
        <UpdateAssignmentModal
          open={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          assignment={selectedAssignment}
          onUpdate={handleUpdateComplete}
        />
      )}
    </Layout>
  );
};

export default Assignment;
