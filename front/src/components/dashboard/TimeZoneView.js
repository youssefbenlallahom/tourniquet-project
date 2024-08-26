import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const TimeZoneView = ({ rows, accessMap, onDelete, onEdit }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Timezones
      </Typography>
      {rows.length === 0 ? (
        <Typography variant="body2">No timezones available.</Typography>
      ) : (
        rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              borderBottom: '1px solid #ccc',
            }}
          >
            <Box>
              <Typography variant="body1">
                {`Timezone for ${row.accessId.map(id => accessMap[id] || 'Unknown Access').join(', ')}`}
              </Typography>
              <Typography variant="body2">
                {`Start: ${new Date(row.start).toLocaleString()} - End: ${new Date(row.end).toLocaleString()}`}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={() => onEdit(row)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default TimeZoneView;
