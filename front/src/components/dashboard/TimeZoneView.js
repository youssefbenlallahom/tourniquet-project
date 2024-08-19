import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

const TimeZoneView = ({ rows, accessMap, onDelete }) => {
  return (
    <Box>
      {rows.map((event) => {
        const formattedStart = event.start instanceof Date && !isNaN(event.start.getTime())
          ? format(event.start, 'yyyy-MM-dd HH:mm')
          : 'Invalid start date';
        const formattedEnd = event.end instanceof Date && !isNaN(event.end.getTime())
          ? format(event.end, 'yyyy-MM-dd HH:mm')
          : 'Invalid end date';
        const accessName = accessMap[event.accessId] || 'Unknown Access';
        return (
          <Box key={event.id} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ flexGrow: 1 }}>
              {event.title} ({accessName}) - Start: {formattedStart} - End: {formattedEnd}
            </Typography>
            <IconButton onClick={() => onDelete(event.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

export default TimeZoneView;
