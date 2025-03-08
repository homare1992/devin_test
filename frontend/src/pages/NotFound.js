import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper 
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: '#fff'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <ErrorOutlineIcon 
            sx={{ 
              fontSize: 100, 
              color: 'error.main' 
            }} 
          />
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          ページが見つかりません
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          お探しのページは存在しないか、移動した可能性があります。
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
          size="large"
          sx={{ mt: 2 }}
        >
          ホームに戻る
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
