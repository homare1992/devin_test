import axios from 'axios';

// APIのベースURL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // リクエスト前の処理
    return config;
  },
  (error) => {
    // リクエストエラーの処理
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    // レスポンス処理
    return response;
  },
  (error) => {
    // エラーレスポンスの処理
    return Promise.reject(error);
  }
);

// APIサービス関数
const apiService = {
  // ヘルスチェック
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // データ解析
  parseData: async (filePath) => {
    try {
      const response = await api.post('/parse', { file_path: filePath });
      return response.data;
    } catch (error) {
      console.error('Parse data error:', error);
      throw error;
    }
  },

  // データ分析
  analyzeData: async () => {
    try {
      const response = await api.get('/analyze');
      return response.data;
    } catch (error) {
      console.error('Analyze data error:', error);
      throw error;
    }
  },

  // 一括処理（解析と分析）
  processData: async (filePath) => {
    try {
      const response = await api.post('/process', { file_path: filePath });
      return response.data;
    } catch (error) {
      console.error('Process data error:', error);
      throw error;
    }
  },

  // イベントデータの取得
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  },

  // 日次サマリーデータの取得
  getDailySummary: async (params = {}) => {
    try {
      const response = await api.get('/summary/daily', { params });
      return response.data;
    } catch (error) {
      console.error('Get daily summary error:', error);
      throw error;
    }
  },

  // 成長データの取得
  getGrowthData: async (params = {}) => {
    try {
      const response = await api.get('/growth', { params });
      return response.data;
    } catch (error) {
      console.error('Get growth data error:', error);
      throw error;
    }
  },

  // 「吐く」イベントの相関分析結果の取得
  getVomitCorrelation: async () => {
    try {
      const response = await api.get('/analysis/vomit-correlation');
      return response.data;
    } catch (error) {
      console.error('Get vomit correlation error:', error);
      throw error;
    }
  },

  // 睡眠パターン分析結果の取得
  getSleepPatterns: async () => {
    try {
      const response = await api.get('/analysis/sleep-patterns');
      return response.data;
    } catch (error) {
      console.error('Get sleep patterns error:', error);
      throw error;
    }
  },

  // 食事パターン分析結果の取得
  getFeedingPatterns: async () => {
    try {
      const response = await api.get('/analysis/feeding-patterns');
      return response.data;
    } catch (error) {
      console.error('Get feeding patterns error:', error);
      throw error;
    }
  },

  // 総合分析結果の取得
  getComprehensiveAnalysis: async () => {
    try {
      const response = await api.get('/analysis/comprehensive');
      return response.data;
    } catch (error) {
      console.error('Get comprehensive analysis error:', error);
      throw error;
    }
  },

  // CSVデータのダウンロードURL取得
  getCsvDownloadUrl: (filename) => {
    return `${API_BASE_URL}/data/csv/${filename}`;
  },
};

export default apiService;
