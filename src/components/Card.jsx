import React from 'react';
import { Card, CardContent, Typography, useTheme, Box } from '@mui/material';

const DashboardCard = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        minWidth: 275,
        boxShadow: theme.shadows[2],
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            color="text.secondary"
            gutterBottom
          >
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: color || theme.palette.primary.light,
              color: theme.palette.getContrastText(
                color || theme.palette.primary.light
              ),
              p: 1,
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;