// src/components/Footer.jsx
import { Box, Typography, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 0.5,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `0.5px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Cholera Reporting System. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;