import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Box,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SickIcon from '@mui/icons-material/Sick';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';

import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import DataCard from '../components/common/DataCard';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import BarChart from '../components/charts/BarChart';

import apiService from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 総合分析データを取得
        const response = await apiService.getComprehensiveAnalysis();
        
        if (response.status === 'success') {
          setSummaryData(response.data.summary);
          setTimeSeriesData(response.data.time_series);
        } else {
          throw new Error('データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('データの読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // データ読み込み中
  if (loading) {
    return <LoadingIndicator />;
  }

  // エラー発生時
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
        />
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/upload"
            startIcon={<UploadFileIcon />}
          >
            データをアップロード
          </Button>
        </Box>
      </Container>
    );
  }

  // データがない場合
  if (!summaryData || !timeSeriesData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ダッシュボード
        </Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              データがありません
            </Typography>
            <Typography variant="body1" color="text.secondary">
              分析を開始するには、データをアップロードしてください。
            </Typography>
          </CardContent>
          <Divider />
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/upload"
              startIcon={<UploadFileIcon />}
            >
              データをアップロード
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  // サマリーデータから必要な情報を抽出
  const stats = summaryData.stats || {};
  const sleepStats = stats.sleep_minutes || {};
  const milkStats = stats.milk_amount || {};
  const vomitStats = stats.vomit_count || {};

  // 時系列データの準備
  const dailyData = timeSeriesData.daily || {};
  const sleepData = dailyData.sleep_minutes?.map((value, index) => ({
    date: dailyData.dates[index],
    value: value / 60 // 分から時間に変換
  })) || [];

  const milkData = dailyData.milk_amount?.map((value, index) => ({
    date: dailyData.dates[index],
    value
  })) || [];

  const vomitData = dailyData.vomit_count?.map((value, index) => ({
    date: dailyData.dates[index],
    value
  })) || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均睡眠時間"
            value={(sleepStats.mean / 60).toFixed(1)}
            unit="時間"
            icon={<NightsStayIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均ミルク量"
            value={milkStats.mean?.toFixed(0) || 0}
            unit="ml"
            icon={<RestaurantIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均吐き戻し回数"
            value={vomitStats.mean?.toFixed(1) || 0}
            unit="回"
            icon={<SickIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="記録日数"
            value={dailyData.dates?.length || 0}
            unit="日"
            icon={<AssessmentIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* チャート */}
      <Grid container spacing={3}>
        {/* 睡眠時間チャート */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <TimeSeriesChart
                data={sleepData}
                xKey="date"
                yKey="value"
                xLabel="日付"
                yLabel="睡眠時間 (時間)"
                title="睡眠時間の推移"
                color="#4caf50"
                height={300}
                formatYAxis={(value) => `${value}h`}
              />
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/sleep"
              >
                詳細を見る
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* ミルク摂取量チャート */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <TimeSeriesChart
                data={milkData}
                xKey="date"
                yKey="value"
                xLabel="日付"
                yLabel="ミルク量 (ml)"
                title="ミルク摂取量の推移"
                color="#ff9800"
                height={300}
                formatYAxis={(value) => `${value}ml`}
              />
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/feeding"
              >
                詳細を見る
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* 吐き戻し回数チャート */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <TimeSeriesChart
                data={vomitData}
                xKey="date"
                yKey="value"
                xLabel="日付"
                yLabel="回数"
                title="吐き戻し回数の推移"
                color="#f44336"
                height={300}
                formatYAxis={(value) => `${value}回`}
              />
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                size="small" 
                component={RouterLink} 
                to="/vomit"
              >
                詳細を見る
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* サマリーテキスト */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                分析サマリー
              </Typography>
              <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                {summaryData.text || '分析データがありません。'}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                variant="contained" 
                color="primary"
                component={RouterLink} 
                to="/upload"
                startIcon={<UploadFileIcon />}
              >
                データを更新
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
