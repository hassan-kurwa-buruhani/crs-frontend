import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  useTheme,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Styled component for active menu items
const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    borderRight: `3px solid ${theme.palette.primary.main}`,
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const drawerWidth = 240;

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    switch(user?.role) {
      case 'Doctor': return '/doctor-dashboard';
      case 'Sheha': return '/sheha-dashboard';
      case 'Health Supervisor': return '/supervisor-dashboard';
      default: return '/dashboard';
    }
  };

  // Menu items with paths
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: getDashboardPath() // Dynamic dashboard path
    },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Integrations', icon: <LayersIcon />, path: '/integrations' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Check if current location matches any dashboard path
  const isDashboardActive = (path) => {
    const dashboardPaths = [
      '/dashboard',
      '/doctor-dashboard',
      '/sheha-dashboard',
      '/supervisor-dashboard'
    ];
    return dashboardPaths.includes(path) && 
           dashboardPaths.includes(location.pathname);
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: 'none',
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              component={Link}
              to={item.path}
              selected={item.path === '/dashboard' 
                ? isDashboardActive(item.path)
                : location.pathname === item.path}
              onClick={onClose}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;