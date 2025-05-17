import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline } from '@mui/icons-material';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use axios directly here to avoid the interceptor trying to refresh tokens
      const response = await axiosInstance.post('/user/login/', {
        username,
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem('isAuthenticated', JSON.stringify(true));
        localStorage.setItem('access', response.data.token.access);
        localStorage.setItem('refresh', response.data.token.refresh);
        onLogin(true);
        navigate('/dashboard/home');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else if (error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('Request configuration error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 10, 
        stiffness: 100,
        duration: 0.8
      }
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        py: 3
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card 
            elevation={8}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Grid container>
              {/* Left side with form */}
              <Grid item xs={12} md={6}>
                <CardContent 
                  sx={{ 
                    padding: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { md: '550px' }
                  }}
                >
                  <motion.div variants={logoVariants}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <img 
                        src="/assets/logo.png" 
                        alt="Game Production Logo" 
                        style={{ 
                          width: '150px',
                          height: 'auto',
                          marginBottom: '16px'
                        }} 
                      />
                      <Typography 
                        variant="h4" 
                        component="h1" 
                        fontWeight="bold" 
                        color="#B30000"
                      >
                        Game Production
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Assignment Management System
                      </Typography>
                    </Box>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                      Please sign in to continue
                    </Typography>
                  </motion.div>

                  {error && (
                    <motion.div 
                      variants={itemVariants}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    </motion.div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <Stack spacing={3}>
                      <motion.div variants={itemVariants}>
                        <TextField
                          fullWidth
                          label="Username"
                          variant="outlined"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutline />
                              </InputAdornment>
                            ),
                          }}
                          required
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          fullWidth
                          label="Password"
                          variant="outlined"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockOutlined />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleClickShowPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          required
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Link 
                          href="#" 
                          onClick={() => navigate('/forgot-password')}
                          variant="body2" 
                          sx={{ 
                            display: 'block', 
                            textAlign: 'right',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Forgot password?
                        </Link>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                            bgcolor: '#B30000',
                            '&:hover': {
                              bgcolor: '#8B0000',
                            }
                          }}
                        >
                          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            Don't have an account?
                          </Typography>
                          <Link 
                            href="#" 
                            onClick={() => navigate('/signup')}
                            variant="body2"
                            sx={{ 
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            Sign Up
                          </Link>
                        </Box>
                      </motion.div>
                    </Stack>
                  </form>
                </CardContent>
              </Grid>

              {/* Right side with image */}
              <Grid 
                item 
                xs={12} 
                md={6} 
                sx={{ 
                  position: 'relative',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507196814259-25695160a8d7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 5,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      backgroundColor: 'rgba(179, 0, 0, 0.8)',
                      backgroundImage: 'linear-gradient(180deg, rgba(179, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%)'
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <Typography variant="h4" component="div" color="white" fontWeight="bold" gutterBottom>
                      Get Ready to Jump
                    </Typography>
                    <Typography variant="body1" color="white" gutterBottom>
                      Discover the best trampoline experience in Tunisia. 
                      Push your limits with Ninja courses, Laser Room, Jump Ball and much more.
                    </Typography>
                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
