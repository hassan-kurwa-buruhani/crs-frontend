import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  Grid,
} from '@mui/material';

const ModernForm = ({ title, fields, onSubmit, submitText = 'Submit' }) => {
  const theme = useTheme();

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
      }}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.name}>
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              required={field.required}
              name={field.name}
              label={field.label}
              type={field.type || 'text'}
              value={field.value}
              onChange={field.onChange}
              InputProps={field.InputProps}
              select={field.select}
              SelectProps={field.SelectProps}
            >
              {field.children}
            </TextField>
          </Grid>
        ))}
      </Grid>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {submitText}
      </Button>
    </Box>
  );
};

export default ModernForm;