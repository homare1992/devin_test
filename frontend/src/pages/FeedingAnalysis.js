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
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CountertopsIcon from '@mui/icons-material/Countertops';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import PageSection from '../components/common/PageSection';
import DataCard from '../components/common/DataCard';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import BarChart from '../components/charts/BarChart';

import apiService from '../services/api';

const FeedingAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedingData, setFeedingData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [hourlyDistribution, setHourlyDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 食事パターン分析データを取得
        const response = await apiService.getFeedingPatterns();
        
        if (response.status === 'success') {
          setFeedingData(response.data);
          
          // 時系列データの準備
          const dailyResponse = await apiService.getDailySummary();
          if (dailyResponse.status === 'success') {
            const dailyData = dailyResponse.data.data;
            
            // ミルク摂取量の時系列データ
            const milkTimeSeries = dailyData.map(day => ({
              date: day.date.split('T')[0],
              value: day.milk_amount
            }));
            setTimeSeriesData(milkTimeSeries);
            
            // ミルク時間の分布データ
            const milkTimeDist = response.data.milk_time_distribution || {};
            const hourlyData = Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}時`,
              count: milkTimeDist[i] || 0
            }));
            setHourlyDistribution(hourlyData);
          }
        } else {
          throw new Error('データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Feeding analysis data fetch error:', err);
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
          食事分析
        </Typography>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  // データがない場合
  if (!feedingData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          食事分析
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              データがありません
            </Typography>
            <Typography variant="body1" color="text.secondary">
              食事データが見つかりませんでした。データをアップロードしてください。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 食事データから必要な情報を抽出
  const dailyMilkAmount = feedingData.daily_milk_amount || {};
  const dailyMilkCount = feedingData.daily_milk_count || {};
  const milkAmountDist = feedingData.milk_amount_distribution || {};
  const milkIntervalMinutes = feedingData.milk_interval_minutes || {};
  
  // ミルク時間の分布
  const milkTimeDist = feedingData.milk_time_distribution || {};
  const mostCommonMilkHour = Object.entries(milkTimeDist)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => hour)[0] || '不明';
    
  // 離乳食時間の分布
  const foodTimeDist = feedingData.food_time_distribution || {};
  const hasFoodData = Object.keys(foodTimeDist).length > 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        食事分析
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均ミルク量"
            value={(dailyMilkAmount.mean || 0).toFixed(0)}
            unit="ml"
            icon={<LocalCafeIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均ミルク回数"
            value={(dailyMilkCount.mean || 0).toFixed(1)}
            unit="回"
            icon={<RestaurantIcon />}
            color="#5e35b1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="最も多いミルク時間"
            value={`${mostCommonMilkHour}`}
            unit="時台"
            icon={<AccessTimeIcon />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均ミルク間隔"
            value={(milkIntervalMinutes.mean / 60 || 0).toFixed(1)}
            unit="時間"
            icon={<CountertopsIcon />}
            color="#00897b"
          />
        </Grid>
      </Grid>

      {/* ミルク摂取量の推移 */}
      <PageSection
        title="ミルク摂取量の推移"
        icon={<LocalCafeIcon />}
        sx={{ mb: 4 }}
      >
        <Box sx={{ height: 400 }}>
          <TimeSeriesChart
            data={timeSeriesData}
            xKey="date"
            yKey="value"
            xLabel="日付"
            yLabel="ミルク量 (ml)"
            color="#ff9800"
            height={400}
            formatYAxis={(value) => `${value}ml`}
            referenceValue={dailyMilkAmount.mean}
            referenceLabel="平均"
          />
        </Box>
      </PageSection>

      {/* 食事パターン分析 */}
      <Grid container spacing={3}>
        {/* ミルク時間の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="ミルク時間の分布"
            icon={<LocalCafeIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={hourlyDistribution}
                xKey="hour"
                yKey="count"
                xLabel="時間帯"
                yLabel="回数"
                color="#ff9800"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* ミルク量の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="ミルク量の分布"
            icon={<RestaurantIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={[
                  { range: '0-50ml', count: milkAmountDist['count'] ? milkAmountDist['count'][0] || 0 : 0 },
                  { range: '50-100ml', count: milkAmountDist['count'] ? milkAmountDist['count'][1] || 0 : 0 },
                  { range: '100-150ml', count: milkAmountDist['count'] ? milkAmountDist['count'][2] || 0 : 0 },
                  { range: '150-200ml', count: milkAmountDist['count'] ? milkAmountDist['count'][3] || 0 : 0 },
                  { range: '200ml以上', count: milkAmountDist['count'] ? milkAmountDist['count'][4] || 0 : 0 }
                ]}
                xKey="range"
                yKey="count"
                xLabel="ミルク量"
                yLabel="回数"
                color="#5e35b1"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* 食事統計 */}
        <Grid item xs={12}>
          <PageSection
            title="食事統計"
            icon={<RestaurantIcon />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  ミルク摂取量の統計
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    平均: {(dailyMilkAmount.mean || 0).toFixed(0)} ml
                  </Typography>
                  <Typography variant="body1">
                    最小: {(dailyMilkAmount.min || 0).toFixed(0)} ml
                  </Typography>
                  <Typography variant="body1">
                    最大: {(dailyMilkAmount.max || 0).toFixed(0)} ml
                  </Typography>
                  <Typography variant="body1">
                    標準偏差: {(dailyMilkAmount.std || 0).toFixed(0)} ml
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  ミルク間隔の統計
                </Typography>
                <Box>
                  <Typography variant="body1">
                    平均間隔: {(milkIntervalMinutes.mean / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最小: {(milkIntervalMinutes.min / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最大: {(milkIntervalMinutes.max / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ※ ミルク間隔は同じ日のミルク摂取間の時間を表します。
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </PageSection>
        </Grid>

        {/* 離乳食データ */}
        {hasFoodData && (
          <Grid item xs={12}>
            <PageSection
              title="離乳食データ"
              icon={<RestaurantIcon />}
            >
              <Box sx={{ height: 300 }}>
                <BarChart
                  data={Object.entries(foodTimeDist).map(([hour, count]) => ({
                    hour: `${hour}時`,
                    count
                  }))}
                  xKey="hour"
                  yKey="count"
                  xLabel="時間帯"
                  yLabel="回数"
                  color="#00897b"
                  height={300}
                  title="離乳食の時間帯分布"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ※ 離乳食の詳細な内容や量については、現在のデータからは分析できません。
              </Typography>
            </PageSection>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default FeedingAnalysis;
