import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SickIcon from '@mui/icons-material/Sick';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ナビゲーションアイテム
  const navItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/' },
    { text: '睡眠分析', icon: <NightsStayIcon />, path: '/sleep' },
    { text: '食事分析', icon: <RestaurantIcon />, path: '/feeding' },
    { text: '吐き戻し分析', icon: <SickIcon />, path: '/vomit' },
    { text: '成長分析', icon: <MonitorWeightIcon />, path: '/growth' },
    { text: 'データアップロード', icon: <UploadFileIcon />, path: '/upload' },
  ];

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '8px',
        }}
      >
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? onClose : undefined}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
