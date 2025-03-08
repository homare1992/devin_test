import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const HeatMapChart = ({ 
  data, 
  xLabels = [], 
  yLabels = [], 
  title = '', 
  colorRange = ['#e8f5e9', '#4caf50'],
  formatValue = (value) => value,
  height = 300,
  cellSize = 30,
  margin = { top: 20, right: 30, left: 50, bottom: 50 }
}) => {
  const theme = useTheme();

  // データが空の場合
  if (!data || data.length === 0 || xLabels.length === 0 || yLabels.length === 0) {
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

  // 最大値と最小値を取得
  const flatData = data.flat();
  const maxValue = Math.max(...flatData);
  const minValue = Math.min(...flatData);

  // 色の計算関数
  const getColor = (value) => {
    if (maxValue === minValue) return colorRange[1];
    const ratio = (value - minValue) / (maxValue - minValue);
    
    // RGB値の線形補間
    const startColor = hexToRgb(colorRange[0]);
    const endColor = hexToRgb(colorRange[1]);
    
    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // HEXカラーをRGBに変換
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // セルの幅と高さを計算
  const cellWidth = cellSize;
  const cellHeight = cellSize;
  
  // チャートの幅と高さを計算
  const chartWidth = margin.left + xLabels.length * cellWidth + margin.right;
  const chartHeight = margin.top + yLabels.length * cellHeight + margin.bottom;

  return (
    <Box sx={{ width: '100%', height, overflowX: 'auto' }}>
      {title && (
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ minWidth: chartWidth, minHeight: chartHeight }}>
        <svg width={chartWidth} height={chartHeight}>
          {/* X軸ラベル */}
          {xLabels.map((label, i) => (
            <text
              key={`x-label-${i}`}
              x={margin.left + i * cellWidth + cellWidth / 2}
              y={margin.top + yLabels.length * cellHeight + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill={theme.palette.text.primary}
            >
              {label}
            </text>
          ))}
          
          {/* Y軸ラベル */}
          {yLabels.map((label, i) => (
            <text
              key={`y-label-${i}`}
              x={margin.left - 10}
              y={margin.top + i * cellHeight + cellHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fill={theme.palette.text.primary}
            >
              {label}
            </text>
          ))}
          
          {/* ヒートマップセル */}
          {data.map((row, rowIndex) => (
            row.map((value, colIndex) => (
              <g key={`cell-${rowIndex}-${colIndex}`}>
                <rect
                  x={margin.left + colIndex * cellWidth}
                  y={margin.top + rowIndex * cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={getColor(value)}
                  stroke={theme.palette.divider}
                  strokeWidth={1}
                />
                <text
                  x={margin.left + colIndex * cellWidth + cellWidth / 2}
                  y={margin.top + rowIndex * cellHeight + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill={theme.palette.getContrastText(getColor(value))}
                >
                  {formatValue(value)}
                </text>
              </g>
            ))
          ))}
        </svg>
      </Box>
    </Box>
  );
};

export default HeatMapChart;
