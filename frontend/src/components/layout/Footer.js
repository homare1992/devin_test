import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {currentYear}
          {' '}
          <Link color="inherit" href="#">
            ぴよログ分析
          </Link>
          {' - 乳児活動記録分析・可視化Webアプリ'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
