import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const Header = ({ toggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img 
            src="/logo192.png" 
            alt="ぴよログ分析" 
            style={{ 
              height: '32px', 
              marginRight: '8px',
              display: 'none', // ロゴ画像がある場合は 'block' に変更
            }} 
          />
          ぴよログ分析
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex' }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
            >
              ダッシュボード
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/upload"
              startIcon={<UploadFileIcon />}
            >
              データアップロード
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
