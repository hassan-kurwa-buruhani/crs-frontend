import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login(credentials);
      if (!success) {
        // Error handling is now done in AuthContext, so we don't need to set error state here
      }
    } catch (error) {
      console.error('Login error:', error);
      // Any unexpected errors will be caught here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        type="text"
        required
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        required
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />
      <Button 
        type="submit" 
        variant="contained" 
        size="large"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </Box>
  );
};

export default Login;