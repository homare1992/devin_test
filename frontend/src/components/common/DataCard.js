import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';

const DataCard = ({ 
  title, 
  value, 
  unit = '', 
  icon = null, 
  color = 'primary.main', 
  trend = null, 
  trendLabel = '', 
  sx = {} 
}) => {
  // トレンドの方向に基づいて色を決定
  const getTrendColor = () => {
    if (trend === null) return 'text.secondary';
    return trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  };

  // トレンドの方向に基づいて記号を決定
  const getTrendSymbol = () => {
    if (trend === null) return '';
    return trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ...sx 
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: color, 
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon && (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      </Box>
      <Divider />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
            <Typography variant="h5" component="span" sx={{ ml: 0.5 }}>
              {unit}
            </Typography>
          </Typography>
          
          {trend !== null && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTrendColor(),
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getTrendSymbol()} {Math.abs(trend)}{unit} {trendLabel}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard;
