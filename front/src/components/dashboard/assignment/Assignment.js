import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Card, CardContent } from '@mui/material';
import { Delete } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';
import Layout from '../../../Layout';
import { useNavigate } from 'react-router-dom';

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/assignment/all/');
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      const response = await axiosInstance.delete(`/assignment/delete/${assignmentId}/`);
      if (response.status === 204) {
        console.log('Assignment removed successfully');
        setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      } else {
        console.error('Failed to remove assignment:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/assignment/new')}>
            Add Assignment
          </Button>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Existing Assignments
          </Typography>
          <List>
            {assignments.map((assignment) => (
              <Card key={assignment.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem>
                    <ListItemText
                      primary={`Bracelet ID: ${assignment.braceletId}, Color: ${assignment.color}, Name: ${assignment.name}`}
                      secondary={`Role: ${assignment.role}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAssignment(assignment.id)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </CardContent>
                <Divider />
              </Card>
            ))}
          </List>
        </Box>
      </Box>
    </Layout>
  );
};

export default Assignment;