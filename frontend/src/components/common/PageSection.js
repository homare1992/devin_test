import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';

const PageSection = ({ 
  title, 
  children, 
  icon = null, 
  elevation = 1, 
  sx = {} 
}) => {
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        mb: 3, 
        overflow: 'hidden',
        ...sx 
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon && (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default PageSection;
