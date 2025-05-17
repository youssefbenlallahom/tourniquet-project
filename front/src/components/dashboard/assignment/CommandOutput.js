import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { Terminal as TerminalIcon, Code as CodeIcon } from '@mui/icons-material';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Main CommandOutput component
const CommandOutput = ({ output, status, loading, commandType }) => {
  const getLoadingText = () => {
    if (commandType === 'log') {
      return 'Fetching real-time logs...';
    }
    return 'Executing command...';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 4 
      }}>
        <CircularProgress sx={{ color: '#B30000' }} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {getLoadingText()}
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (!output) {
    return null;
  }

  // Process output to enhance display
  const lines = output.split('\n');

  return (
    <Paper 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        mb: 4,
        position: 'relative'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2,
          bgcolor: status === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TerminalIcon sx={{ 
            mr: 1.5, 
            color: status === 'success' ? '#4CAF50' : '#F44336',
            bgcolor: 'rgba(255,255,255,0.8)',
            p: 0.5,
            borderRadius: '50%',
            fontSize: 28
          }} />          <Typography variant="h6" fontWeight="600" color={status === 'success' ? '#2E7D32' : '#C62828'}>
            {commandType === 'log' ? 'Real-Time Access Logs' : 'Command Output'}
          </Typography>
        </Box>
        
        <Chip 
          label={status === 'success' ? 'SUCCESS' : 'ERROR'} 
          color={status === 'success' ? 'success' : 'error'}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
      
      {/* Terminal Output */}
      <Box 
        sx={{ 
          p: 2,
          bgcolor: '#0B1929', 
          color: '#EAEAEA',
          fontFamily: 'monospace',
          overflow: 'auto',
          maxHeight: '400px',
        }}
      >
        {lines.map((line, index) => {
          // Skip empty lines
          if (!line.trim()) return null;
          
          // Enhanced line styling based on content
          const isError = line.toLowerCase().includes('error');
          const isWarning = line.toLowerCase().includes('warning');
          const isSuccess = line.toLowerCase().includes('success');
          
          let lineStyle = {};
          
          if (isError) {
            lineStyle = { color: '#FF6B6B', fontWeight: 'bold' };
          } else if (isWarning) {
            lineStyle = { color: '#FFCA28', fontWeight: 'bold' };
          } else if (isSuccess) {
            lineStyle = { color: '#66BB6A', fontWeight: 'bold' };
          }
          
          return (
            <motion.div 
              key={index}
              variants={itemVariants}
              sx={{ 
                display: 'block',
                py: 0.3,
                borderLeft: isError ? '2px solid #FF6B6B' : 
                         isWarning ? '2px solid #FFCA28' : 
                         isSuccess ? '2px solid #66BB6A' : 'none',
                pl: isError || isWarning || isSuccess ? 1.5 : 0
              }}
            >
              <Typography 
                variant="body2" 
                component="span"
                sx={{ 
                  ...lineStyle, 
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {line}
              </Typography>
            </motion.div>
          );
        })}
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          p: 1.5, 
          bgcolor: '#f8f8f8',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
          <Typography variant="caption" color="text.secondary">
            Command executed on {new Date().toLocaleString()}
          </Typography>
        </Box>
        
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          {status === 'success' ? 'Operation completed successfully' : 'Operation completed with errors'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CommandOutput;