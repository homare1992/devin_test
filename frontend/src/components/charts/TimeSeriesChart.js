import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const TimeSeriesChart = ({ 
  data, 
  xKey = 'date', 
  yKey = 'value', 
  xLabel = '日付', 
  yLabel = '値', 
  title = '', 
  color = '#4caf50',
  referenceValue = null,
  referenceLabel = '',
  formatTooltip = null,
  formatYAxis = null,
  height = 300,
  margin = { top: 20, right: 30, left: 20, bottom: 50 }
}) => {
  const theme = useTheme();

  // データが空の場合
  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2
        }}
      >
        <Typography variant="body1" color="text.secondary">
          データがありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey={xKey} 
            label={{ 
              value: xLabel, 
              position: 'insideBottomRight', 
              offset: -10 
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: 'insideLeft' 
            }}
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              boxShadow: theme.shadows[2]
            }}
          />
          <Legend />
          {referenceValue !== null && (
            <ReferenceLine 
              y={referenceValue} 
              stroke="#ff9800" 
              strokeDasharray="3 3"
              label={{ 
                value: referenceLabel, 
                position: 'right',
                fill: '#ff9800'
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TimeSeriesChart;
