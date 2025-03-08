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
import NightsStayIcon from '@mui/icons-material/NightsStay';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import PageSection from '../components/common/PageSection';
import DataCard from '../components/common/DataCard';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import BarChart from '../components/charts/BarChart';
import HeatMapChart from '../components/charts/HeatMapChart';

import apiService from '../services/api';

const SleepAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [hourlyDistribution, setHourlyDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 睡眠パターン分析データを取得
        const response = await apiService.getSleepPatterns();
        
        if (response.status === 'success') {
          setSleepData(response.data);
          
          // 時系列データの準備
          const dailyResponse = await apiService.getDailySummary();
          if (dailyResponse.status === 'success') {
            const dailyData = dailyResponse.data.data;
            
            // 睡眠時間の時系列データ
            const sleepTimeSeries = dailyData.map(day => ({
              date: day.date.split('T')[0],
              value: day.sleep_minutes / 60 // 分から時間に変換
            }));
            setTimeSeriesData(sleepTimeSeries);
            
            // 睡眠開始時間の分布データ
            const sleepStartDist = response.data.sleep_start_distribution || {};
            const hourlyData = Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}時`,
              count: sleepStartDist[i] || 0
            }));
            setHourlyDistribution(hourlyData);
          }
        } else {
          throw new Error('データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Sleep analysis data fetch error:', err);
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
          睡眠分析
        </Typography>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  // データがない場合
  if (!sleepData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          睡眠分析
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              データがありません
            </Typography>
            <Typography variant="body1" color="text.secondary">
              睡眠データが見つかりませんでした。データをアップロードしてください。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 睡眠データから必要な情報を抽出
  const dailySleepMinutes = sleepData.daily_sleep_minutes || {};
  const dailySleepHours = sleepData.daily_sleep_hours || {};
  const sleepDurationMinutes = sleepData.sleep_duration_minutes || {};
  const sleepFragmentation = sleepData.sleep_fragmentation || {};
  
  // 睡眠開始時間の分布
  const sleepStartDist = sleepData.sleep_start_distribution || {};
  const mostCommonSleepStartHour = Object.entries(sleepStartDist)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => hour)[0] || '不明';
    
  // 起床時間の分布
  const wakeTimeDist = sleepData.wake_time_distribution || {};
  const mostCommonWakeHour = Object.entries(wakeTimeDist)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => hour)[0] || '不明';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        睡眠分析
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均睡眠時間"
            value={(dailySleepHours.mean || 0).toFixed(1)}
            unit="時間"
            icon={<NightsStayIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="最も多い就寝時間"
            value={`${mostCommonSleepStartHour}`}
            unit="時台"
            icon={<BedtimeIcon />}
            color="#5e35b1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="最も多い起床時間"
            value={`${mostCommonWakeHour}`}
            unit="時台"
            icon={<WbTwilightIcon />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="睡眠の断片化指数"
            value={(sleepFragmentation.mean || 0).toFixed(2)}
            icon={<AccessTimeIcon />}
            color="#e53935"
          />
        </Grid>
      </Grid>

      {/* 睡眠時間の推移 */}
      <PageSection
        title="睡眠時間の推移"
        icon={<NightsStayIcon />}
        sx={{ mb: 4 }}
      >
        <Box sx={{ height: 400 }}>
          <TimeSeriesChart
            data={timeSeriesData}
            xKey="date"
            yKey="value"
            xLabel="日付"
            yLabel="睡眠時間 (時間)"
            color="#4caf50"
            height={400}
            formatYAxis={(value) => `${value}h`}
            referenceValue={dailySleepHours.mean}
            referenceLabel="平均"
          />
        </Box>
      </PageSection>

      {/* 睡眠パターン分析 */}
      <Grid container spacing={3}>
        {/* 就寝時間の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="就寝時間の分布"
            icon={<BedtimeIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={hourlyDistribution}
                xKey="hour"
                yKey="count"
                xLabel="時間帯"
                yLabel="回数"
                color="#5e35b1"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* 起床時間の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="起床時間の分布"
            icon={<WbTwilightIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={Object.entries(wakeTimeDist).map(([hour, count]) => ({
                  hour: `${hour}時`,
                  count
                }))}
                xKey="hour"
                yKey="count"
                xLabel="時間帯"
                yLabel="回数"
                color="#fb8c00"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* 睡眠時間の統計 */}
        <Grid item xs={12}>
          <PageSection
            title="睡眠時間の統計"
            icon={<NightsStayIcon />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  日次睡眠時間の統計
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    平均: {(dailySleepHours.mean || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最小: {(dailySleepHours.min || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最大: {(dailySleepHours.max || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    標準偏差: {(dailySleepHours.std || 0).toFixed(1)} 時間
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  睡眠の断片化
                </Typography>
                <Box>
                  <Typography variant="body1">
                    平均断片化指数: {(sleepFragmentation.mean || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    最小: {(sleepFragmentation.min || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    最大: {(sleepFragmentation.max || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ※ 断片化指数は睡眠時間あたりの起床回数を表します。値が大きいほど睡眠が断片化されていることを示します。
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </PageSection>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SleepAnalysis;
