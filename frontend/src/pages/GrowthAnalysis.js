import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  Box
} from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import HeightIcon from '@mui/icons-material/Height';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import PageSection from '../components/common/PageSection';
import DataCard from '../components/common/DataCard';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';

import apiService from '../services/api';

const GrowthAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [heightData, setHeightData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 成長データを取得
        const response = await apiService.getGrowthData();
        
        if (response.status === 'success') {
          setGrowthData(response.data);
          
          // 体重データの準備
          const weightTimeSeries = response.data.weight_records?.map(record => ({
            date: record.date.split('T')[0],
            value: record.value / 1000 // グラムからキログラムに変換
          })) || [];
          setWeightData(weightTimeSeries);
          
          // 身長データの準備
          const heightTimeSeries = response.data.height_records?.map(record => ({
            date: record.date.split('T')[0],
            value: record.value
          })) || [];
          setHeightData(heightTimeSeries);
        } else {
          throw new Error('データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Growth data fetch error:', err);
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
          成長分析
        </Typography>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  // データがない場合
  if (!growthData || (!weightData.length && !heightData.length)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          成長分析
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              データがありません
            </Typography>
            <Typography variant="body1" color="text.secondary">
              成長データが見つかりませんでした。データをアップロードしてください。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 成長データから必要な情報を抽出
  const weightStats = growthData.weight_stats || {};
  const heightStats = growthData.height_stats || {};
  const ageMonths = growthData.age_months || 0;
  
  // 最新の記録
  const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1].value : 0;
  const latestHeight = heightData.length > 0 ? heightData[heightData.length - 1].value : 0;
  
  // 成長率の計算
  const firstWeight = weightData.length > 0 ? weightData[0].value : 0;
  const firstHeight = heightData.length > 0 ? heightData[0].value : 0;
  
  const weightGrowthRate = firstWeight > 0 ? ((latestWeight - firstWeight) / firstWeight) * 100 : 0;
  const heightGrowthRate = firstHeight > 0 ? ((latestHeight - firstHeight) / firstHeight) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        成長分析
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="現在の体重"
            value={latestWeight.toFixed(2)}
            unit="kg"
            icon={<MonitorWeightIcon />}
            color="#9c27b0"
            trend={weightGrowthRate.toFixed(1)}
            trendLabel="成長率"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="現在の身長"
            value={latestHeight.toFixed(1)}
            unit="cm"
            icon={<HeightIcon />}
            color="#00897b"
            trend={heightGrowthRate.toFixed(1)}
            trendLabel="成長率"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="月齢"
            value={ageMonths}
            unit="ヶ月"
            icon={<CalendarMonthIcon />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="記録回数"
            value={weightData.length}
            unit="回"
            icon={<TrendingUpIcon />}
            color="#5e35b1"
          />
        </Grid>
      </Grid>

      {/* 体重の推移 */}
      <PageSection
        title="体重の推移"
        icon={<MonitorWeightIcon />}
        sx={{ mb: 4 }}
      >
        <Box sx={{ height: 400 }}>
          <TimeSeriesChart
            data={weightData}
            xKey="date"
            yKey="value"
            xLabel="日付"
            yLabel="体重 (kg)"
            color="#9c27b0"
            height={400}
            formatYAxis={(value) => `${value}kg`}
          />
        </Box>
      </PageSection>

      {/* 身長の推移 */}
      <PageSection
        title="身長の推移"
        icon={<HeightIcon />}
        sx={{ mb: 4 }}
      >
        <Box sx={{ height: 400 }}>
          <TimeSeriesChart
            data={heightData}
            xKey="date"
            yKey="value"
            xLabel="日付"
            yLabel="身長 (cm)"
            color="#00897b"
            height={400}
            formatYAxis={(value) => `${value}cm`}
          />
        </Box>
      </PageSection>

      {/* 成長統計 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PageSection
            title="体重の統計"
            icon={<MonitorWeightIcon />}
          >
            <Typography variant="body1">
              初回記録: {firstWeight.toFixed(2)} kg
            </Typography>
            <Typography variant="body1">
              最新記録: {latestWeight.toFixed(2)} kg
            </Typography>
            <Typography variant="body1">
              増加量: {(latestWeight - firstWeight).toFixed(2)} kg
            </Typography>
            <Typography variant="body1">
              成長率: {weightGrowthRate.toFixed(1)}%
            </Typography>
            <Typography variant="body1">
              平均増加率: {(weightGrowthRate / (weightData.length > 1 ? weightData.length - 1 : 1)).toFixed(2)}% / 記録
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ※ 成長率は初回記録からの変化率を表します。
            </Typography>
          </PageSection>
        </Grid>
        <Grid item xs={12} md={6}>
          <PageSection
            title="身長の統計"
            icon={<HeightIcon />}
          >
            <Typography variant="body1">
              初回記録: {firstHeight.toFixed(1)} cm
            </Typography>
            <Typography variant="body1">
              最新記録: {latestHeight.toFixed(1)} cm
            </Typography>
            <Typography variant="body1">
              増加量: {(latestHeight - firstHeight).toFixed(1)} cm
            </Typography>
            <Typography variant="body1">
              成長率: {heightGrowthRate.toFixed(1)}%
            </Typography>
            <Typography variant="body1">
              平均増加率: {(heightGrowthRate / (heightData.length > 1 ? heightData.length - 1 : 1)).toFixed(2)}% / 記録
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ※ 成長率は初回記録からの変化率を表します。
            </Typography>
          </PageSection>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GrowthAnalysis;
