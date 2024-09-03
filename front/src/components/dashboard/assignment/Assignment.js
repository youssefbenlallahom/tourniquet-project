import React, { useState, useEffect } from 'react';
import {
  Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Collapse, Paper,
  TableContainer, Tooltip, Typography
} from '@mui/material';
import { Add as AddIcon, Delete, Edit, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import UpdateAssignmentModal from './UpdateAssignmentModal'; // Ensure the path is correct

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [expandedTimezones, setExpandedTimezones] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/assignment/all/');
        console.log(response.data);
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        alert('Failed to fetch assignments. Please check the console for details.');
      }
    };

    fetchAssignments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/assignment/delete/${id}/`);
      setAssignments(assignments.filter(assignment => assignment.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment. Please check the console for details.');
    }
  };

  const handleUpdate = (assignment) => {
    setSelectedAssignment(assignment);
    setIsUpdateModalOpen(true);
  };

  const handleRowClick = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTimezoneToggle = (id) => {
    setExpandedTimezones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <Layout>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Assignment Configuration</Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/assignment/new')}>
            Add Assignment
          </Button>
        </Box>

        {assignments.length === 0 ? (
          <Typography variant="h6" align="center" color="textSecondary">
            No assignments found.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Bracelet ID</TableCell>
                  <TableCell align="left">Color</TableCell>
                  <TableCell align="left">Role Name</TableCell>
                  <TableCell align="center">Timezones</TableCell>
                  <TableCell align="center">Access</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <React.Fragment key={assignment.id}>
                    <TableRow hover>
                      <TableCell align="left">{assignment.braceletId}</TableCell>
                      <TableCell align="left">{assignment.color}</TableCell>
                      <TableCell align="left">{assignment.role?.roleName || 'No Role'}</TableCell>
                      <TableCell align="center">
                        {assignment.timezone_ids && assignment.timezone_ids.length > 0 ? (
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => handleTimezoneToggle(assignment.id)}
                              aria-expanded={expandedTimezones[assignment.id]}
                            >
                              {expandedTimezones[assignment.id] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                            <Typography variant="body2" color="textSecondary" ml={1}>
                              {assignment.timezone_ids.length} Timezones
                            </Typography>
                          </Box>
                        ) : (
                          'No Timezones'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {assignment.access_ids && assignment.access_ids.length > 0 ? (
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRowClick(assignment.id)}
                              aria-expanded={openRows[assignment.id]}
                            >
                              {openRows[assignment.id] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                            <Typography variant="body2" color="textSecondary" ml={1}>
                              {assignment.access_ids.length} Accesses
                            </Typography>
                          </Box>
                        ) : (
                          'No Access'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Assignment">
                          <IconButton color="primary" onClick={() => handleUpdate(assignment)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Assignment">
                          <IconButton color="secondary" onClick={() => handleDelete(assignment.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {/* Timezones and Access collapse rows */}
                    {assignment.timezone_ids && assignment.timezone_ids.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={expandedTimezones[assignment.id]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              {assignment.timezone_ids.map(timezone => (
                                <Box key={timezone.id} sx={{ padding: 1, border: '1px solid #ddd', borderRadius: 2, mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Start:</strong> {formatDate(timezone.startTime)}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>End:</strong> {formatDate(timezone.endTime)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                    {assignment.access_ids && assignment.access_ids.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                          <Collapse in={openRows[assignment.id]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              {assignment.access_ids.map((access) => (
                                <Box key={access.id} sx={{ padding: 1, border: '1px solid #ddd', borderRadius: 2, mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Game Name:</strong> {access.GameName || 'Unknown'}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Doors:</strong> {access.doors.map(door => door.id).join(', ') || 'None'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Update Assignment Modal */}
        {selectedAssignment && (
          <UpdateAssignmentModal
            open={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            assignment={selectedAssignment}
            onUpdate={(updatedData) => {
              setAssignments(assignments.map(assignment => 
                assignment.id === updatedData.id ? updatedData : assignment
              ));
            }}
          />
        )}
      </Box>
    </Layout>
  );
};

export default Assignment;
