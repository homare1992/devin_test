import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// コンポーネント
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// ページ
import Dashboard from './pages/Dashboard';
import SleepAnalysis from './pages/SleepAnalysis';
import FeedingAnalysis from './pages/FeedingAnalysis';
import VomitAnalysis from './pages/VomitAnalysis';
import GrowthAnalysis from './pages/GrowthAnalysis';
import DataUpload from './pages/DataUpload';
import NotFound from './pages/NotFound';

// スタイル
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            width: { xs: '100%', md: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
            transition: 'width 0.3s ease',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sleep" element={<SleepAnalysis />} />
            <Route path="/feeding" element={<FeedingAnalysis />} />
            <Route path="/vomit" element={<VomitAnalysis />} />
            <Route path="/growth" element={<GrowthAnalysis />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Box>
      </Box>
    </div>
  );
}

export default App;
