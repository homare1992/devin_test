import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ErrorMessage = ({ 
  title = 'エラーが発生しました', 
  message = 'データの取得中にエラーが発生しました。もう一度お試しください。', 
  onRetry = null 
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert 
        severity="error" 
        variant="outlined"
        action={
          onRetry && (
            <Button 
              color="error" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              再試行
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
