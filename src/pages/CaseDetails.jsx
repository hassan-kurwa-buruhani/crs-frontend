// src/pages/CaseDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button as MuiButton,
  IconButton,
} from '@mui/material';
import Button from '../components/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user role from localStorage or AuthContext if you have it
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userRole = user.role;

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}cases/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setCaseData(response.data);
      } catch (error) {
        console.error('Error fetching case details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        await axios.delete(`${apiUrl}cases/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        navigate('/cases'); // Redirect to cases list after deletion
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  if (loading) {
    return (
      <Typography variant="body1" sx={{ p: 4 }}>
        Loading case details...
      </Typography>
    );
  }

  if (!caseData) {
    return (
      <Typography variant="body1" sx={{ p: 4 }}>
        Case not found.
      </Typography>
    );
  }

  const { patient, health_center, doctor_full_name, district, region, date, description } = caseData;

  return (
    <Box sx={{ p: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <MuiButton onClick={() => navigate(-1)} variant="outlined">
          ← Back
        </MuiButton>
        {/* Only show Edit and Delete if NOT Sheha or Health Supervisor */}
        {userRole !== 'HealthSupervisor' && (
          <Box>
            <IconButton 
              onClick={() => navigate(`/cases/${id}/update`)} 
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={handleDelete} 
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Case Details
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Patient Information
        </Typography>
        <Typography variant="body1">
          <strong>Name:</strong> {patient.first_name} {patient.last_name}
        </Typography>
        <Typography variant="body1">
          <strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}
        </Typography>
        <Typography variant="body1">
          <strong>Condition:</strong> {patient.condition} | <strong>Status:</strong> {patient.status}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Street:</strong> {patient.street}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Report Information
        </Typography>
        <Typography variant="body1">
          <strong>Health Center:</strong> {health_center}
        </Typography>
        <Typography variant="body1">
          <strong>Doctor:</strong> {doctor_full_name}
        </Typography>
        <Typography variant="body1">
          <strong>District:</strong> {district}
        </Typography>
        <Typography variant="body1">
          <strong>Region:</strong> {region} 
        </Typography>
        <Typography variant="body1">
          <strong>Date:</strong> {date}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {description}
        </Typography>
      </Paper>
    </Box>
  );
};

export default CaseDetails;
