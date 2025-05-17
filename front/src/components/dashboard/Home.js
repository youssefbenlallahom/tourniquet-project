import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper, Container } from '@mui/material';
import Layout from '../../Layout';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.7
    }
  }
};

const Home = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box 
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ 
            p: { xs: 2, md: 4 },
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(11, 25, 41, 0.95), rgba(179, 0, 0, 0.85))',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <Box component={motion.div} variants={textVariants}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="700"
                sx={{ 
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  mb: 3,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.5px'
                }}
              >
                Welcome to Game Production
              </Typography>
              
              <Typography 
                variant="h5"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                  fontWeight: 400,
                  lineHeight: 1.4,
                  maxWidth: '800px',
                  mx: 'auto',
                  mb: 2
                }}
              >
                The ultimate destination for all your entertainment needs, all in one place!
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  maxWidth: '700px',
                  mx: 'auto',
                  mt: 2
                }}
              >
                Experience seamless access management and extraordinary entertainment options.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;