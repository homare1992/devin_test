#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
乳児活動記録データの分析モジュール

このモジュールは、構造化された乳児の活動記録データを分析し、
時系列分析、パターン分析、相関分析などの機能を提供します。
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats


class BabyLogAnalyzer:
    """乳児活動記録データの分析クラス"""

    def __init__(self, events_df: pd.DataFrame = None, daily_summary_df: pd.DataFrame = None, growth_df: pd.DataFrame = None):
        """
        分析クラスの初期化

        Args:
            events_df: イベントデータのDataFrame
            daily_summary_df: 日次サマリーデータのDataFrame
            growth_df: 成長データのDataFrame
        """
        self.events_df = events_df
        self.daily_summary_df = daily_summary_df
        self.growth_df = growth_df
        
    def load_data(self, data_dir: str) -> None:
        """
        CSVファイルからデータを読み込む

        Args:
            data_dir: データディレクトリのパス
        """
        try:
            # イベントデータの読み込み
            self.events_df = pd.read_csv(
                os.path.join(data_dir, 'events.csv'),
                parse_dates=['date', 'datetime']
            )
            
            # 日次サマリーデータの読み込み
            self.daily_summary_df = pd.read_csv(
                os.path.join(data_dir, 'daily_summary.csv'),
                parse_dates=['date']
            )
            
            # 成長データの読み込み
            growth_file = os.path.join(data_dir, 'growth.csv')
            if os.path.getsize(growth_file) > 10:  # ファイルサイズが十分にある場合のみ読み込む
                self.growth_df = pd.read_csv(
                    growth_file,
                    parse_dates=['date', 'datetime']
                )
            else:
                # 空のDataFrameを作成（必要な列を含む）
                self.growth_df = pd.DataFrame(columns=[
                    'date', 'datetime', 'type', 'value', 'unit', 
                    'baby_name', 'age_years', 'age_months', 'age_days'
                ])
                # 日付列をdatetime型に変換
                self.growth_df['date'] = pd.to_datetime(self.growth_df['date'])
                self.growth_df['datetime'] = pd.to_datetime(self.growth_df['datetime'])
            
            print("データ読み込み完了")
        except Exception as e:
            print(f"データ読み込みエラー: {e}")
    
    def get_time_series_data(self, category: str = None, value_column: str = 'value', 
                            unit: str = None, resample_rule: str = 'D') -> pd.DataFrame:
        """
        時系列データを取得する

        Args:
            category: イベントカテゴリ（例: 'sleep', 'milk', 'vomit'）
            value_column: 値のカラム名
            unit: 単位でフィルタリング
            resample_rule: リサンプリングルール（例: 'D'=日次, 'H'=時間単位）

        Returns:
            時系列データのDataFrame
        """
        if self.events_df is None:
            print("イベントデータが読み込まれていません")
            return pd.DataFrame()
        
        # カテゴリでフィルタリング
        if category:
            df = self.events_df[self.events_df['category'] == category].copy()
        else:
            df = self.events_df.copy()
            
        # 単位でフィルタリング
        if unit:
            df = df[df['unit'] == unit]
            
        # 値が存在するデータのみ抽出
        df = df.dropna(subset=[value_column])
        
        # 時系列インデックスに変換
        df.set_index('datetime', inplace=True)
        
        # リサンプリング（集計）
        if resample_rule:
            # カテゴリごとに異なる集計方法を適用
            if category == 'sleep':
                # 睡眠時間の合計
                resampled = df.resample(resample_rule)[value_column].sum()
            elif category == 'vomit':
                # 吐くイベントの回数と重症度の合計
                count = df.resample(resample_rule).size()
                severity = df.resample(resample_rule)[value_column].sum()
                resampled = pd.DataFrame({
                    'count': count,
                    'severity': severity
                })
            else:
                # デフォルトは平均と合計
                resampled = pd.DataFrame({
                    'mean': df.resample(resample_rule)[value_column].mean(),
                    'sum': df.resample(resample_rule)[value_column].sum(),
                    'count': df.resample(resample_rule).size()
                })
                
            return resampled
        
        return df
    
    def get_daily_patterns(self, category: str, value_column: str = 'value', 
                          unit: str = None, hour_bins: int = 24) -> pd.DataFrame:
        """
        時間帯別のパターンを分析する

        Args:
            category: イベントカテゴリ
            value_column: 値のカラム名
            unit: 単位でフィルタリング
            hour_bins: 1日の時間区分数（デフォルト24=1時間ごと）

        Returns:
            時間帯別パターンのDataFrame
        """
        if self.events_df is None:
            print("イベントデータが読み込まれていません")
            return pd.DataFrame()
        
        # カテゴリでフィルタリング
        df = self.events_df[self.events_df['category'] == category].copy()
        
        # 単位でフィルタリング
        if unit:
            df = df[df['unit'] == unit]
            
        # 値が存在するデータのみ抽出
        df = df.dropna(subset=[value_column])
        
        # 時間帯の抽出
        df['hour'] = df['datetime'].dt.hour
        df['minute'] = df['datetime'].dt.minute
        df['time_decimal'] = df['hour'] + df['minute'] / 60
        
        # 時間帯ごとの集計
        if hour_bins == 24:
            # 1時間ごとの集計
            df['hour_bin'] = df['hour']
            hour_labels = [f"{h:02d}:00" for h in range(24)]
        else:
            # カスタム時間区分での集計
            bin_size = 24 / hour_bins
            df['hour_bin'] = (df['time_decimal'] // bin_size).astype(int)
            hour_labels = [f"{int(h*bin_size):02d}:00-{int((h+1)*bin_size):02d}:00" for h in range(hour_bins)]
        
        # 時間帯別の集計
        pattern_df = df.groupby('hour_bin').agg({
            value_column: ['count', 'mean', 'sum'],
            'date': 'nunique'  # 日数のカウント
        })
        
        # カラム名の整理
        pattern_df.columns = ['count', 'mean', 'sum', 'days']
        
        # 日数で正規化（1日あたりの平均）
        pattern_df['daily_avg'] = pattern_df['count'] / pattern_df['days']
        
        # インデックスをラベルに置き換え
        pattern_df.index = hour_labels
        
        return pattern_df
    
    def analyze_vomit_correlation(self) -> Dict[str, Any]:
        """
        「吐く」イベントと他の要因の相関を分析する

        Returns:
            相関分析結果の辞書
        """
        if self.events_df is None or self.daily_summary_df is None:
            print("データが読み込まれていません")
            return {}
        
        # 日次データの準備
        daily_df = self.daily_summary_df.copy()
        
        # 相関分析の結果を格納する辞書
        correlations = {}
        
        # 1. ミルク摂取量と吐くイベントの相関
        milk_vomit_corr = stats.pearsonr(daily_df['milk_amount'], daily_df['vomit_count'])
        correlations['milk_amount_vomit_count'] = {
            'correlation': milk_vomit_corr[0],
            'p_value': milk_vomit_corr[1]
        }
        
        # 2. 睡眠時間と吐くイベントの相関
        sleep_vomit_corr = stats.pearsonr(daily_df['sleep_minutes'], daily_df['vomit_count'])
        correlations['sleep_minutes_vomit_count'] = {
            'correlation': sleep_vomit_corr[0],
            'p_value': sleep_vomit_corr[1]
        }
        
        # 3. 前日のミルク摂取量と当日の吐くイベントの相関（1日ラグ）
        daily_df['milk_amount_lag1'] = daily_df['milk_amount'].shift(1)
        daily_df_lag = daily_df.dropna(subset=['milk_amount_lag1'])
        if len(daily_df_lag) > 0:
            milk_lag_vomit_corr = stats.pearsonr(daily_df_lag['milk_amount_lag1'], daily_df_lag['vomit_count'])
            correlations['milk_amount_lag1_vomit_count'] = {
                'correlation': milk_lag_vomit_corr[0],
                'p_value': milk_lag_vomit_corr[1]
            }
        
        # 4. ミルク回数と吐くイベントの相関
        milk_count_vomit_corr = stats.pearsonr(daily_df['milk_count'], daily_df['vomit_count'])
        correlations['milk_count_vomit_count'] = {
            'correlation': milk_count_vomit_corr[0],
            'p_value': milk_count_vomit_corr[1]
        }
        
        # 5. 排泄回数と吐くイベントの相関
        pee_vomit_corr = stats.pearsonr(daily_df['pee_count'], daily_df['vomit_count'])
        correlations['pee_count_vomit_count'] = {
            'correlation': pee_vomit_corr[0],
            'p_value': pee_vomit_corr[1]
        }
        
        poop_vomit_corr = stats.pearsonr(daily_df['poop_count'], daily_df['vomit_count'])
        correlations['poop_count_vomit_count'] = {
            'correlation': poop_vomit_corr[0],
            'p_value': poop_vomit_corr[1]
        }
        
        # 6. 時間帯別の吐くイベント分析
        vomit_events = self.events_df[self.events_df['category'] == 'vomit'].copy()
        vomit_events['hour'] = vomit_events['datetime'].dt.hour
        hour_counts = vomit_events.groupby('hour').size()
        
        correlations['vomit_hour_distribution'] = hour_counts.to_dict()
        
        # 7. ミルク摂取後の吐くイベント分析
        # ミルクイベントを抽出
        milk_events = self.events_df[self.events_df['category'] == 'milk'].copy()
        
        # 各ミルクイベント後の吐くイベントを検索
        time_windows = [30, 60, 120]  # 分単位のウィンドウ
        milk_followed_by_vomit = {window: 0 for window in time_windows}
        
        for _, milk_row in milk_events.iterrows():
            milk_time = milk_row['datetime']
            
            for window in time_windows:
                # ウィンドウ内の吐くイベントを検索
                window_end = milk_time + timedelta(minutes=window)
                vomit_after_milk = vomit_events[
                    (vomit_events['datetime'] > milk_time) & 
                    (vomit_events['datetime'] <= window_end)
                ]
                
                if len(vomit_after_milk) > 0:
                    milk_followed_by_vomit[window] += 1
        
        # ミルク後の吐くイベント率を計算
        for window in time_windows:
            milk_followed_by_vomit[f"{window}min_rate"] = milk_followed_by_vomit[window] / len(milk_events) if len(milk_events) > 0 else 0
        
        correlations['milk_followed_by_vomit'] = milk_followed_by_vomit
        
        return correlations
    
    def analyze_sleep_patterns(self) -> Dict[str, Any]:
        """
        睡眠パターンを分析する

        Returns:
            睡眠パターン分析結果の辞書
        """
        if self.events_df is None:
            print("イベントデータが読み込まれていません")
            return {}
        
        # 睡眠関連イベントを抽出
        sleep_events = self.events_df[self.events_df['category'] == 'sleep'].copy()
        wake_events = self.events_df[self.events_df['category'] == 'wake'].copy()
        
        # 日付ごとの睡眠時間
        daily_sleep = self.daily_summary_df[['date', 'sleep_minutes']].copy()
        daily_sleep['sleep_hours'] = daily_sleep['sleep_minutes'] / 60
        
        # 睡眠の開始時間分布
        sleep_events['hour'] = sleep_events['datetime'].dt.hour
        sleep_start_dist = sleep_events.groupby('hour').size()
        
        # 起床時間分布
        wake_events['hour'] = wake_events['datetime'].dt.hour
        wake_time_dist = wake_events.groupby('hour').size()
        
        # 睡眠の持続時間分布
        sleep_durations = sleep_events[sleep_events['value'].notna()]['value'].copy()
        
        # 結果の辞書
        sleep_analysis = {
            'daily_sleep_minutes': daily_sleep['sleep_minutes'].describe().to_dict(),
            'daily_sleep_hours': daily_sleep['sleep_hours'].describe().to_dict(),
            'sleep_start_distribution': sleep_start_dist.to_dict(),
            'wake_time_distribution': wake_time_dist.to_dict(),
            'sleep_duration_minutes': sleep_durations.describe().to_dict() if len(sleep_durations) > 0 else {}
        }
        
        # 睡眠の断片化（起床回数/睡眠時間）
        daily_sleep['wake_count'] = wake_events.groupby(wake_events['date'].dt.date).size()
        daily_sleep['sleep_fragmentation'] = daily_sleep['wake_count'] / (daily_sleep['sleep_hours'] + 0.001)  # ゼロ除算回避
        
        sleep_analysis['sleep_fragmentation'] = daily_sleep['sleep_fragmentation'].describe().to_dict()
        
        return sleep_analysis
    
    def analyze_feeding_patterns(self) -> Dict[str, Any]:
        """
        食事パターンを分析する

        Returns:
            食事パターン分析結果の辞書
        """
        if self.events_df is None or self.daily_summary_df is None:
            print("データが読み込まれていません")
            return {}
        
        # ミルク関連イベントを抽出
        milk_events = self.events_df[self.events_df['category'] == 'milk'].copy()
        
        # 離乳食イベントを抽出
        food_events = self.events_df[self.events_df['category'] == 'food'].copy()
        
        # 日次のミルク摂取量
        daily_milk = self.daily_summary_df[['date', 'milk_amount', 'milk_count']].copy()
        
        # ミルクの時間帯分布
        milk_events['hour'] = milk_events['datetime'].dt.hour
        milk_time_dist = milk_events.groupby('hour').size()
        
        # ミルク量の分布
        milk_amount_dist = milk_events[milk_events['value'].notna()]['value'].describe()
        
        # 離乳食の時間帯分布
        if len(food_events) > 0:
            food_events['hour'] = food_events['datetime'].dt.hour
            food_time_dist = food_events.groupby('hour').size()
        else:
            food_time_dist = pd.Series()
        
        # 結果の辞書
        feeding_analysis = {
            'daily_milk_amount': daily_milk['milk_amount'].describe().to_dict(),
            'daily_milk_count': daily_milk['milk_count'].describe().to_dict(),
            'milk_time_distribution': milk_time_dist.to_dict(),
            'milk_amount_distribution': milk_amount_dist.to_dict(),
            'food_time_distribution': food_time_dist.to_dict() if len(food_time_dist) > 0 else {}
        }
        
        # ミルク間隔の分析
        if len(milk_events) > 1:
            milk_events_sorted = milk_events.sort_values('datetime')
            milk_events_sorted['next_milk_time'] = milk_events_sorted['datetime'].shift(-1)
            milk_events_sorted['milk_interval'] = (milk_events_sorted['next_milk_time'] - milk_events_sorted['datetime']).dt.total_seconds() / 60  # 分単位
            
            # 同じ日のミルクのみを対象
            milk_events_sorted['date'] = milk_events_sorted['datetime'].dt.date
            milk_events_sorted['next_date'] = milk_events_sorted['next_milk_time'].dt.date
            valid_intervals = milk_events_sorted[milk_events_sorted['date'] == milk_events_sorted['next_date']]['milk_interval']
            
            feeding_analysis['milk_interval_minutes'] = valid_intervals.describe().to_dict() if len(valid_intervals) > 0 else {}
        
        return feeding_analysis
    
    def analyze_growth(self) -> Dict[str, Any]:
        """
        成長データを分析する

        Returns:
            成長分析結果の辞書
        """
        if self.growth_df is None:
            print("成長データが読み込まれていません")
            return {}
        
        # 体重データ
        weight_data = self.growth_df[self.growth_df['type'] == 'weight'].copy()
        
        # 単位の統一（gをkgに変換）
        weight_data.loc[weight_data['unit'] == 'g', 'value'] = weight_data.loc[weight_data['unit'] == 'g', 'value'] / 1000
        weight_data['unit'] = 'kg'
        
        # 身長データ
        height_data = self.growth_df[self.growth_df['type'] == 'height'].copy()
        
        # 体温データ
        temp_data = self.growth_df[self.growth_df['type'] == 'temperature'].copy()
        
        # 結果の辞書
        growth_analysis = {}
        
        # 体重の推移
        if len(weight_data) > 0:
            weight_data_sorted = weight_data.sort_values('date')
            growth_analysis['weight_kg'] = {
                'first': weight_data_sorted.iloc[0]['value'],
                'last': weight_data_sorted.iloc[-1]['value'],
                'min': weight_data_sorted['value'].min(),
                'max': weight_data_sorted['value'].max(),
                'change': weight_data_sorted.iloc[-1]['value'] - weight_data_sorted.iloc[0]['value'],
                'data': weight_data_sorted[['date', 'value']].values.tolist()
            }
        
        # 身長の推移
        if len(height_data) > 0:
            height_data_sorted = height_data.sort_values('date')
            growth_analysis['height_cm'] = {
                'first': height_data_sorted.iloc[0]['value'],
                'last': height_data_sorted.iloc[-1]['value'],
                'change': height_data_sorted.iloc[-1]['value'] - height_data_sorted.iloc[0]['value'],
                'data': height_data_sorted[['date', 'value']].values.tolist()
            }
        
        # 体温の統計
        if len(temp_data) > 0:
            growth_analysis['temperature_celsius'] = {
                'min': temp_data['value'].min(),
                'max': temp_data['value'].max(),
                'mean': temp_data['value'].mean(),
                'median': temp_data['value'].median(),
                'std': temp_data['value'].std(),
                'data': temp_data[['date', 'value']].values.tolist()
            }
            
            # 発熱日の特定（37.5度以上を発熱と定義）
            fever_days = temp_data[temp_data['value'] >= 37.5]['date'].dt.date.unique()
            growth_analysis['fever_days'] = [d.strftime('%Y-%m-%d') for d in fever_days]
        
        return growth_analysis
    
    def get_comprehensive_analysis(self) -> Dict[str, Any]:
        """
        総合的な分析結果を取得する

        Returns:
            総合分析結果の辞書
        """
        # 各分析を実行
        vomit_correlation = self.analyze_vomit_correlation()
        sleep_patterns = self.analyze_sleep_patterns()
        feeding_patterns = self.analyze_feeding_patterns()
        growth_data = self.analyze_growth()
        
        # 日次サマリー統計
        if self.daily_summary_df is not None:
            daily_stats = {
                'sleep_minutes': self.daily_summary_df['sleep_minutes'].describe().to_dict(),
                'milk_amount': self.daily_summary_df['milk_amount'].describe().to_dict(),
                'milk_count': self.daily_summary_df['milk_count'].describe().to_dict(),
                'pee_count': self.daily_summary_df['pee_count'].describe().to_dict(),
                'poop_count': self.daily_summary_df['poop_count'].describe().to_dict(),
                'vomit_count': self.daily_summary_df['vomit_count'].describe().to_dict() if 'vomit_count' in self.daily_summary_df.columns else {},
                'vomit_level_sum': self.daily_summary_df['vomit_level_sum'].describe().to_dict() if 'vomit_level_sum' in self.daily_summary_df.columns else {}
            }
        else:
            daily_stats = {}
        
        # 時系列データ
        time_series = {}
        if self.daily_summary_df is not None:
            # 日次データの時系列
            daily_ts = self.daily_summary_df.set_index('date')
            time_series['daily'] = {
                'dates': daily_ts.index.strftime('%Y-%m-%d').tolist(),
                'sleep_minutes': daily_ts['sleep_minutes'].tolist(),
                'milk_amount': daily_ts['milk_amount'].tolist(),
                'milk_count': daily_ts['milk_count'].tolist(),
                'pee_count': daily_ts['pee_count'].tolist(),
                'poop_count': daily_ts['poop_count'].tolist(),
                'vomit_count': daily_ts['vomit_count'].tolist() if 'vomit_count' in daily_ts.columns else [],
                'vomit_level_sum': daily_ts['vomit_level_sum'].tolist() if 'vomit_level_sum' in daily_ts.columns else []
            }
        
        # 総合分析結果
        comprehensive_analysis = {
            'daily_stats': daily_stats,
            'time_series': time_series,
            'vomit_correlation': vomit_correlation,
            'sleep_patterns': sleep_patterns,
            'feeding_patterns': feeding_patterns,
            'growth': growth_data
        }
        
        return comprehensive_analysis


def main():
    """メイン関数"""
    # データディレクトリ
    data_dir = "../data"
    
    # 分析クラスの初期化
    analyzer = BabyLogAnalyzer()
    
    # データの読み込み
    analyzer.load_data(data_dir)
    
    # 総合分析の実行
    analysis_results = analyzer.get_comprehensive_analysis()
    
    # 結果の出力（例: JSON形式）
    import json
    with open(os.path.join(data_dir, 'analysis_results.json'), 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    
    print("分析完了: 結果を保存しました")


if __name__ == "__main__":
    main()
