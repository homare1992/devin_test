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
import SickIcon from '@mui/icons-material/Sick';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import PageSection from '../components/common/PageSection';
import DataCard from '../components/common/DataCard';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import BarChart from '../components/charts/BarChart';
import ScatterChart from '../components/charts/ScatterChart';

import apiService from '../services/api';

const VomitAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vomitData, setVomitData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [hourlyDistribution, setHourlyDistribution] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 吐き戻し相関分析データを取得
        const response = await apiService.getVomitCorrelation();
        
        if (response.status === 'success') {
          setVomitData(response.data);
          
          // 時系列データの準備
          const dailyResponse = await apiService.getDailySummary();
          if (dailyResponse.status === 'success') {
            const dailyData = dailyResponse.data.data;
            
            // 吐き戻し回数の時系列データ
            const vomitTimeSeries = dailyData.map(day => ({
              date: day.date.split('T')[0],
              value: day.vomit_count
            }));
            setTimeSeriesData(vomitTimeSeries);
            
            // 吐き戻し時間の分布データ
            const vomitTimeDist = response.data.vomit_time_distribution || {};
            const hourlyData = Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}時`,
              count: vomitTimeDist[i] || 0
            }));
            setHourlyDistribution(hourlyData);
            
            // ミルク量と吐き戻しの相関データ
            const milkVomitCorr = response.data.milk_vomit_correlation || [];
            const corrData = milkVomitCorr.map(item => ({
              x: item.milk_amount,
              y: item.vomit_count,
              name: item.date
            }));
            setCorrelationData(corrData);
          }
        } else {
          throw new Error('データの取得に失敗しました');
        }
      } catch (err) {
        console.error('Vomit analysis data fetch error:', err);
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
          吐き戻し分析
        </Typography>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  // データがない場合
  if (!vomitData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          吐き戻し分析
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              データがありません
            </Typography>
            <Typography variant="body1" color="text.secondary">
              吐き戻しデータが見つかりませんでした。データをアップロードしてください。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 吐き戻しデータから必要な情報を抽出
  const dailyVomitCount = vomitData.daily_vomit_count || {};
  const vomitSeverity = vomitData.vomit_severity || {};
  const vomitTimeDist = vomitData.vomit_time_distribution || {};
  const milkVomitInterval = vomitData.milk_vomit_interval_minutes || {};
  
  // 吐き戻し時間の分布
  const mostCommonVomitHour = Object.entries(vomitTimeDist)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => hour)[0] || '不明';
    
  // 吐き戻し量の分布
  const vomitSeverityDist = vomitData.vomit_severity_distribution || {};
  const severityLabels = {
    'small': '小',
    'medium': '中',
    'large': '大',
    'extreme_small': '極小'
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        吐き戻し分析
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="平均吐き戻し回数"
            value={(dailyVomitCount.mean || 0).toFixed(1)}
            unit="回/日"
            icon={<SickIcon />}
            color="#e53935"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="最も多い吐き戻し時間"
            value={`${mostCommonVomitHour}`}
            unit="時台"
            icon={<AccessTimeIcon />}
            color="#fb8c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="ミルク後の平均吐き戻し時間"
            value={(milkVomitInterval.mean / 60 || 0).toFixed(1)}
            unit="時間"
            icon={<LocalCafeIcon />}
            color="#5e35b1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard
            title="最も多い吐き戻し量"
            value={
              Object.entries(vomitSeverityDist)
                .sort((a, b) => b[1] - a[1])
                .map(([severity]) => severityLabels[severity] || severity)[0] || '不明'
            }
            icon={<SickIcon />}
            color="#00897b"
          />
        </Grid>
      </Grid>

      {/* 吐き戻し回数の推移 */}
      <PageSection
        title="吐き戻し回数の推移"
        icon={<SickIcon />}
        sx={{ mb: 4 }}
      >
        <Box sx={{ height: 400 }}>
          <TimeSeriesChart
            data={timeSeriesData}
            xKey="date"
            yKey="value"
            xLabel="日付"
            yLabel="吐き戻し回数"
            color="#e53935"
            height={400}
            formatYAxis={(value) => `${value}回`}
            referenceValue={dailyVomitCount.mean}
            referenceLabel="平均"
          />
        </Box>
      </PageSection>

      {/* 吐き戻しパターン分析 */}
      <Grid container spacing={3}>
        {/* 吐き戻し時間の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="吐き戻し時間の分布"
            icon={<AccessTimeIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={hourlyDistribution}
                xKey="hour"
                yKey="count"
                xLabel="時間帯"
                yLabel="回数"
                color="#e53935"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* 吐き戻し量の分布 */}
        <Grid item xs={12} md={6}>
          <PageSection
            title="吐き戻し量の分布"
            icon={<SickIcon />}
          >
            <Box sx={{ height: 300 }}>
              <BarChart
                data={Object.entries(vomitSeverityDist).map(([severity, count]) => ({
                  severity: severityLabels[severity] || severity,
                  count
                }))}
                xKey="severity"
                yKey="count"
                xLabel="吐き戻し量"
                yLabel="回数"
                color="#00897b"
                height={300}
              />
            </Box>
          </PageSection>
        </Grid>

        {/* ミルク量と吐き戻しの相関 */}
        <Grid item xs={12}>
          <PageSection
            title="ミルク量と吐き戻しの相関"
            icon={<ScatterPlotIcon />}
          >
            <Box sx={{ height: 400 }}>
              <ScatterChart
                data={correlationData}
                xKey="x"
                yKey="y"
                nameKey="name"
                xLabel="ミルク量 (ml)"
                yLabel="吐き戻し回数"
                color="#5e35b1"
                height={400}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              ※ 各点は1日のデータを表します。横軸はその日のミルク総量、縦軸はその日の吐き戻し回数です。
            </Typography>
          </PageSection>
        </Grid>

        {/* 吐き戻し統計 */}
        <Grid item xs={12}>
          <PageSection
            title="吐き戻し統計"
            icon={<SickIcon />}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  日次吐き戻し回数の統計
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    平均: {(dailyVomitCount.mean || 0).toFixed(1)} 回/日
                  </Typography>
                  <Typography variant="body1">
                    最小: {(dailyVomitCount.min || 0).toFixed(0)} 回/日
                  </Typography>
                  <Typography variant="body1">
                    最大: {(dailyVomitCount.max || 0).toFixed(0)} 回/日
                  </Typography>
                  <Typography variant="body1">
                    標準偏差: {(dailyVomitCount.std || 0).toFixed(1)} 回/日
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  ミルク後の吐き戻し時間
                </Typography>
                <Box>
                  <Typography variant="body1">
                    平均: {(milkVomitInterval.mean / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最小: {(milkVomitInterval.min / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body1">
                    最大: {(milkVomitInterval.max / 60 || 0).toFixed(1)} 時間
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ※ ミルク後の吐き戻し時間は、ミルク摂取後に吐き戻しが発生するまでの時間を表します。
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

export default VomitAnalysis;
