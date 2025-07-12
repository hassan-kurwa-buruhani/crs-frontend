import React from 'react';
import { Grid, Box, Typography, useTheme } from '@mui/material';
import DashboardCard from '../components/Card';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Revenue"
            value="$24,000"
            icon={<AttachMoneyIcon />}
            color={theme.palette.success.light}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Users"
            value="1,600"
            icon={<PeopleIcon />}
            color={theme.palette.info.light}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Orders"
            value="356"
            icon={<ShoppingCartIcon />}
            color={theme.palette.warning.light}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Performance"
            value="98%"
            icon={<BarChartIcon />}
            color={theme.palette.primary.light}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;