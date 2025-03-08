import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import PageSection from '../components/common/PageSection';
import apiService from '../services/api';

// ステップの定義
const steps = ['データファイルの選択', '解析と分析', '完了'];

const DataUpload = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // ステップ1: ファイルパスの入力
  const handleFilePathChange = (e) => {
    setFilePath(e.target.value);
  };

  // ステップ2: データの処理
  const handleProcessData = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // データの解析と分析を実行
      const response = await apiService.processData(filePath);
      
      if (response.status === 'success') {
        setResult(response.data);
        setActiveStep(2); // 完了ステップへ
      } else {
        throw new Error(response.message || 'データ処理中にエラーが発生しました');
      }
    } catch (err) {
      console.error('Data processing error:', err);
      setError(err.message || 'データ処理中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  // 次のステップへ進む
  const handleNext = () => {
    if (activeStep === 0) {
      // ファイルパスが入力されているか確認
      if (!filePath.trim()) {
        setError('ファイルパスを入力してください');
        return;
      }
      setError(null);
      setActiveStep(1);
    } else if (activeStep === 1) {
      // データ処理を実行
      handleProcessData();
    }
  };

  // 前のステップに戻る
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // ダッシュボードに移動
  const handleGoToDashboard = () => {
    navigate('/');
  };

  // ステップ1のコンテンツ
  const renderStepOne = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="body1" paragraph>
        分析するデータファイルのパスを入力してください。デフォルトでは「input/【ぴよログ】2024年2月.txt」が使用されます。
      </Typography>
      <TextField
        fullWidth
        label="ファイルパス"
        variant="outlined"
        value={filePath}
        onChange={handleFilePathChange}
        placeholder="input/【ぴよログ】2024年2月.txt"
        helperText="空白の場合はデフォルトのファイルが使用されます"
        sx={{ mb: 3 }}
      />
    </Box>
  );

  // ステップ2のコンテンツ
  const renderStepTwo = () => (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      {processing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6">データを処理しています...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            しばらくお待ちください。この処理には数分かかる場合があります。
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" paragraph>
            「処理開始」ボタンをクリックして、データの解析と分析を開始します。
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AnalyticsIcon />}
            onClick={handleNext}
            size="large"
            sx={{ mt: 2 }}
          >
            処理開始
          </Button>
        </Box>
      )}
    </Box>
  );

  // ステップ3のコンテンツ
  const renderStepThree = () => (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
      </Box>
      <Typography variant="h5" align="center" gutterBottom>
        データ処理が完了しました！
      </Typography>
      
      {result && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            処理結果
          </Typography>
          <Typography variant="body1">
            イベント数: {result.events_count || 0}
          </Typography>
          <Typography variant="body1">
            日数: {result.days_count || 0}
          </Typography>
          <Typography variant="body1">
            成長記録数: {result.growth_records || 0}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToDashboard}
          size="large"
        >
          ダッシュボードを表示
        </Button>
      </Box>
    </Box>
  );

  // エラーメッセージ
  const renderError = () => (
    error && (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        <AlertTitle>エラー</AlertTitle>
        {error}
      </Alert>
    )
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        データアップロード
      </Typography>

      <PageSection
        title="データ処理"
        icon={<UploadFileIcon />}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderError()}

        {activeStep === 0 && renderStepOne()}
        {activeStep === 1 && renderStepTwo()}
        {activeStep === 2 && renderStepThree()}

        {activeStep < 2 && !processing && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              戻る
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              {activeStep === 0 ? '次へ' : '処理開始'}
            </Button>
          </Box>
        )}
      </PageSection>
    </Container>
  );
};

export default DataUpload;
