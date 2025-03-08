import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingIndicator = ({ message = 'データを読み込んでいます...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        minHeight: '200px',
      }}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;
