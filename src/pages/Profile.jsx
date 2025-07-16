import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  useTheme,
  Button,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        
        const response = await axios.get(`${apiUrl}users/${user.id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfileData();
    }
  }, [user]);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>No profile data found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 6,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Paper elevation={3} sx={{ 
        width: '100%', 
        p: 4, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            User Profile
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditProfile}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            Edit Profile
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          mb: 4
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: '150px'
          }}>
            <Avatar sx={{ 
              width: 120, 
              height: 120, 
              fontSize: '3rem',
              bgcolor: theme.palette.primary.main,
              mb: 2
            }}>
              {profileData.first_name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileData.role}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.first_name} {profileData.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                @{profileData.username}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3
            }}>
              <ProfileField label="Email" value={profileData.email} />
              <ProfileField label="Phone" value={profileData.phone} />
              <ProfileField label="Account Status" value={profileData.is_active ? 'Active' : 'Inactive'} />
              <ProfileField label="Staff Status" value={profileData.is_staff ? 'Yes' : 'No'} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const ProfileField = ({ label, value }) => {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        {value || 'Not provided'}
      </Typography>
    </Box>
  );
};

export default Profile;