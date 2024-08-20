import React, { useState, useEffect } from 'react';
import {
  Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Collapse, Paper,
  TableContainer, Tooltip, Typography
} from '@mui/material';
import { Add as AddIcon, Delete, Edit, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
const Access = () => {
  const [accesses, setAccesses] = useState([]);
  const [doorsMap, setDoorsMap] = useState({});
  const [openRows, setOpenRows] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        setAccesses(response.data);
        fetchDoors(response.data.flatMap(access => access.doors));
      } catch (error) {
        console.error('Error fetching accesses:', error);
        alert('Failed to fetch accesses. Please check the console for details.');
      }
    };

    const fetchDoors = async (doorIds) => {
      try {
        const response = await axiosInstance.get(`/door/all/`);
        const doors = response.data;
        const doorsMap = doors.reduce((map, door) => {
          map[door.id] = door;
          return map;
        }, {});
        setDoorsMap(doorsMap);
      } catch (error) {
        console.error('Error fetching doors:', error);
        alert('Failed to fetch doors. Please check the console for details.');
      }
    };

    fetchAccesses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/access/delete/${id}/`);
      setAccesses(accesses.filter(access => access.id !== id));
    } catch (error) {
      console.error('Error deleting access:', error);
      alert('Failed to delete access. Please check the console for details.');
    }
  };

  const handleUpdate = (id) => {
    navigate(`/access/update/${id}`);
  };

  const handleRowClick = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Access Configuration</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/access/new')}>
          Add Access
        </Button>
      </Box>

      {accesses.length === 0 ? (
        <Typography variant="h6" align="center" color="textSecondary">
          No access records found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">Game Name</TableCell>
                <TableCell align="left">Doors</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accesses.map((access) => (
                <React.Fragment key={access.id}>
                  <TableRow hover>
                    <TableCell align="left">{access.GameName}</TableCell>
                    <TableCell align="left">
                      {access.doors && access.doors.length > 1 ? (
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRowClick(access.id)}
                            aria-expanded={openRows[access.id]}
                          >
                            {openRows[access.id] ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                          <Typography variant="body2" color="textSecondary" ml={1}>
                            {access.doors.length} Doors
                          </Typography>
                        </Box>
                      ) : (
                        access.doors.map(doorId => {
                          const door = doorsMap[doorId] || {};
                          return `Device ${door.device || 'Unknown'}, Type ${door.type || 'Unknown'}`;
                        }).join(', ')
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Access">
                        <IconButton color="primary" onClick={() => handleUpdate(access.id)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Access">
                        <IconButton color="secondary" onClick={() => handleDelete(access.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  {access.doors && access.doors.length > 1 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={openRows[access.id]} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            {access.doors.map((doorId) => {
                              const door = doorsMap[doorId] || {};
                              return (
                                <Box key={doorId} sx={{ padding: 1, border: '1px solid #ddd', borderRadius: 2, mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Device:</strong> {door.device || 'Unknown'}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Type:</strong> {door.type || 'Unknown'}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Door Number:</strong> {door.doorNumber || 'N/A'}
                                  </Typography>
                                </Box>
                              );
                            })}
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
    </Box>
    </Layout>
  );
};

export default Access;
