import React from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart as RechartsScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Label
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const ScatterChart = ({ 
  data, 
  xKey = 'x', 
  yKey = 'y', 
  nameKey = 'name',
  xLabel = 'X軸', 
  yLabel = 'Y軸', 
  title = '', 
  color = '#4caf50',
  xReferenceValue = null,
  yReferenceValue = null,
  xReferenceLabel = '',
  yReferenceLabel = '',
  formatTooltip = null,
  formatXAxis = null,
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

  // ツールチップのカスタマイズ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          {data[nameKey] && (
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {data[nameKey]}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {xLabel}: {formatTooltip ? formatTooltip(data[xKey], xKey) : data[xKey]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {yLabel}: {formatTooltip ? formatTooltip(data[yKey], yKey) : data[yKey]}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            type="number"
            dataKey={xKey} 
            name={xLabel}
            tickFormatter={formatXAxis}
            label={{ 
              value: xLabel, 
              position: 'insideBottomRight', 
              offset: -10 
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number"
            dataKey={yKey} 
            name={yLabel}
            tickFormatter={formatYAxis}
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: 'insideLeft' 
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {xReferenceValue !== null && (
            <ReferenceLine 
              x={xReferenceValue} 
              stroke="#ff9800" 
              strokeDasharray="3 3"
            >
              <Label 
                value={xReferenceLabel} 
                position="insideTopRight"
                fill="#ff9800"
              />
            </ReferenceLine>
          )}
          
          {yReferenceValue !== null && (
            <ReferenceLine 
              y={yReferenceValue} 
              stroke="#ff9800" 
              strokeDasharray="3 3"
            >
              <Label 
                value={yReferenceLabel} 
                position="insideRightTop"
                fill="#ff9800"
              />
            </ReferenceLine>
          )}
          
          <Scatter 
            name={title} 
            data={data} 
            fill={color}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ScatterChart;
