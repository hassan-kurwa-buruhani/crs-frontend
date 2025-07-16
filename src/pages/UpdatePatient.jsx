import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, MenuItem, Container, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // ✅ Make sure you import your context

const CONDITIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Severe', label: 'Severe' }
];

const STATUS = [
  { value: 'Recovered', label: 'Recovered' },
  { value: 'Dead', label: 'Dead' },
  { value: 'Alive', label: 'Alive' }
];

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

const UpdatePatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ get current user

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getEndpointPrefix = () => {
    switch (user.role) {
      case 'Doctor':
        return 'doctor/';
      case 'Sheha':
        return 'sheha/';
      case 'Health Supervisor':
        return 'supervisor/';
      default:
        return ''; // fallback if role is missing
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const endpointPrefix = getEndpointPrefix();
        const response = await axios.get(`${apiUrl}${endpointPrefix}patients/${id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setPatient(response.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // ✅ make sure user is ready first
      fetchPatient();
    }
  }, [id, user]);

  const handleChange = (field, value) => {
    setPatient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const endpointPrefix = getEndpointPrefix();
      await axios.put(`${apiUrl}${endpointPrefix}patients/${id}/`, patient, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      navigate(-1);
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading patient...</Typography>;
  }

  if (!patient) {
    return <Typography>Patient not found</Typography>;
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" mb={3}>Update Patient Information</Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3
            }}
          >
            <TextField
              label="First Name"
              value={patient.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
            />
            <TextField
              label="Last Name"
              value={patient.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
            />
            <TextField
              label="Age"
              type="number"
              value={patient.age || ''}
              onChange={(e) => handleChange('age', e.target.value)}
              required
            />
            <TextField
              label="Phone"
              value={patient.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <TextField
              label="Street"
              value={patient.street || ''}
              onChange={(e) => handleChange('street', e.target.value)}
            />
            <TextField
              label="Gender"
              select
              value={patient.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            >
              {GENDERS.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Condition"
              select
              value={patient.condition || ''}
              onChange={(e) => handleChange('condition', e.target.value)}
              required
            >
              {CONDITIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Status"
              select
              value={patient.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              required
            >
              {STATUS.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Patient'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UpdatePatient;
