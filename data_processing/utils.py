#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
乳児活動記録データ処理のユーティリティ関数

このモジュールは、データ処理や分析に役立つ共通の関数を提供します。
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional


def ensure_directory(directory_path: str) -> None:
    """
    ディレクトリが存在することを確認し、存在しない場合は作成する

    Args:
        directory_path: 確認/作成するディレクトリのパス
    """
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        print(f"ディレクトリを作成しました: {directory_path}")


def save_json(data: Dict[str, Any], file_path: str, ensure_dir: bool = True) -> None:
    """
    データをJSON形式で保存する

    Args:
        data: 保存するデータ（辞書形式）
        file_path: 保存先のファイルパス
        ensure_dir: ディレクトリの存在を確認するかどうか
    """
    if ensure_dir:
        ensure_directory(os.path.dirname(file_path))
        
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"JSONファイルを保存しました: {file_path}")


def load_json(file_path: str) -> Dict[str, Any]:
    """
    JSONファイルからデータを読み込む

    Args:
        file_path: 読み込むファイルのパス

    Returns:
        読み込んだデータ（辞書形式）
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"JSONファイル読み込みエラー: {e}")
        return {}


def format_time_duration(minutes: float) -> str:
    """
    分単位の時間を「時間分」形式にフォーマットする

    Args:
        minutes: 分単位の時間

    Returns:
        フォーマットされた時間文字列
    """
    hours = int(minutes // 60)
    mins = int(minutes % 60)
    return f"{hours}時間{mins}分"


def format_datetime(dt: datetime) -> str:
    """
    日時を「YYYY/MM/DD HH:MM」形式にフォーマットする

    Args:
        dt: 日時オブジェクト

    Returns:
        フォーマットされた日時文字列
    """
    return dt.strftime('%Y/%m/%d %H:%M')


def format_date(dt: datetime) -> str:
    """
    日付を「YYYY/MM/DD」形式にフォーマットする

    Args:
        dt: 日時オブジェクト

    Returns:
        フォーマットされた日付文字列
    """
    return dt.strftime('%Y/%m/%d')


def calculate_age_days(birth_date: datetime, target_date: datetime) -> int:
    """
    生年月日から指定日までの日数を計算する

    Args:
        birth_date: 生年月日
        target_date: 計算対象の日付

    Returns:
        日数
    """
    delta = target_date - birth_date
    return delta.days


def calculate_age_months(birth_date: datetime, target_date: datetime) -> Tuple[int, int, int]:
    """
    生年月日から指定日までの年齢（年、月、日）を計算する

    Args:
        birth_date: 生年月日
        target_date: 計算対象の日付

    Returns:
        (年, 月, 日)のタプル
    """
    years = target_date.year - birth_date.year
    months = target_date.month - birth_date.month
    days = target_date.day - birth_date.day
    
    # 日数の調整
    if days < 0:
        # 前月の最終日を取得
        last_day = (target_date.replace(day=1) - timedelta(days=1)).day
        days += last_day
        months -= 1
    
    # 月数の調整
    if months < 0:
        months += 12
        years -= 1
    
    return years, months, days


def get_correlation_strength(correlation: float) -> str:
    """
    相関係数の強さを言語表現に変換する

    Args:
        correlation: 相関係数（-1.0〜1.0）

    Returns:
        相関の強さを表す文字列
    """
    abs_corr = abs(correlation)
    
    if abs_corr < 0.2:
        strength = "ほとんどなし"
    elif abs_corr < 0.4:
        strength = "弱い"
    elif abs_corr < 0.6:
        strength = "中程度"
    elif abs_corr < 0.8:
        strength = "強い"
    else:
        strength = "非常に強い"
    
    direction = "正" if correlation >= 0 else "負"
    
    return f"{direction}の{strength}相関"


def get_percentile(value: float, data: List[float]) -> float:
    """
    データセット内での値のパーセンタイルを計算する

    Args:
        value: パーセンタイルを計算する値
        data: データセット

    Returns:
        パーセンタイル（0〜100）
    """
    sorted_data = sorted(data)
    n = len(sorted_data)
    
    if n == 0:
        return 0
    
    # 値がデータセットの最小値より小さい場合
    if value < sorted_data[0]:
        return 0
    
    # 値がデータセットの最大値より大きい場合
    if value > sorted_data[-1]:
        return 100
    
    # 値と一致するデータを探す
    for i, x in enumerate(sorted_data):
        if x >= value:
            # 線形補間でパーセンタイルを計算
            if x == value:
                return 100 * (i + 0.5) / n
            else:
                # 値が2つのデータポイントの間にある場合
                if i > 0:
                    prev_x = sorted_data[i-1]
                    t = (value - prev_x) / (x - prev_x)
                    return 100 * (i - 1 + t) / n
                else:
                    return 100 * i / n
    
    return 100


def generate_summary_text(analysis_results: Dict[str, Any]) -> str:
    """
    分析結果から要約テキストを生成する

    Args:
        analysis_results: 分析結果の辞書

    Returns:
        要約テキスト
    """
    summary_text = "【分析結果サマリー】\n\n"
    
    # 日次統計サマリー
    if 'daily_stats' in analysis_results and analysis_results['daily_stats']:
        daily_stats = analysis_results['daily_stats']
        summary_text += "■ 日次統計\n"
        
        if 'sleep_minutes' in daily_stats:
            sleep_stats = daily_stats['sleep_minutes']
            avg_sleep = sleep_stats.get('mean', 0) / 60  # 時間に変換
            summary_text += f"・平均睡眠時間: {avg_sleep:.1f}時間\n"
        
        if 'milk_amount' in daily_stats:
            milk_stats = daily_stats['milk_amount']
            avg_milk = milk_stats.get('mean', 0)
            summary_text += f"・平均ミルク摂取量: {avg_milk:.0f}ml\n"
        
        if 'milk_count' in daily_stats:
            milk_count_stats = daily_stats['milk_count']
            avg_milk_count = milk_count_stats.get('mean', 0)
            summary_text += f"・平均ミルク回数: {avg_milk_count:.1f}回\n"
        
        if 'vomit_count' in daily_stats:
            vomit_stats = daily_stats['vomit_count']
            avg_vomit = vomit_stats.get('mean', 0)
            summary_text += f"・平均吐く回数: {avg_vomit:.1f}回\n"
        
        summary_text += "\n"
    
    # 吐くイベントの相関分析
    if 'vomit_correlation' in analysis_results and analysis_results['vomit_correlation']:
        vomit_corr = analysis_results['vomit_correlation']
        summary_text += "■ 「吐く」イベントの相関分析\n"
        
        # ミルク摂取量と吐くイベントの相関
        if 'milk_amount_vomit_count' in vomit_corr:
            milk_vomit = vomit_corr['milk_amount_vomit_count']
            corr = milk_vomit.get('correlation', 0)
            p_value = milk_vomit.get('p_value', 1)
            
            summary_text += f"・ミルク摂取量と吐く回数: {corr:.2f} ({get_correlation_strength(corr)})"
            if p_value < 0.05:
                summary_text += " [統計的に有意]"
            summary_text += "\n"
        
        # 睡眠時間と吐くイベントの相関
        if 'sleep_minutes_vomit_count' in vomit_corr:
            sleep_vomit = vomit_corr['sleep_minutes_vomit_count']
            corr = sleep_vomit.get('correlation', 0)
            p_value = sleep_vomit.get('p_value', 1)
            
            summary_text += f"・睡眠時間と吐く回数: {corr:.2f} ({get_correlation_strength(corr)})"
            if p_value < 0.05:
                summary_text += " [統計的に有意]"
            summary_text += "\n"
        
        # ミルク後の吐くイベント
        if 'milk_followed_by_vomit' in vomit_corr:
            milk_followed = vomit_corr['milk_followed_by_vomit']
            if '60min_rate' in milk_followed:
                rate_60min = milk_followed['60min_rate'] * 100
                summary_text += f"・ミルク摂取後60分以内に吐く確率: {rate_60min:.1f}%\n"
        
        summary_text += "\n"
    
    # 睡眠パターン
    if 'sleep_patterns' in analysis_results and analysis_results['sleep_patterns']:
        sleep_patterns = analysis_results['sleep_patterns']
        summary_text += "■ 睡眠パターン\n"
        
        # 睡眠の断片化
        if 'sleep_fragmentation' in sleep_patterns:
            frag = sleep_patterns['sleep_fragmentation']
            avg_frag = frag.get('mean', 0)
            summary_text += f"・睡眠の断片化指数: {avg_frag:.2f} (値が大きいほど断片化が大きい)\n"
        
        # 睡眠開始時間の分布
        if 'sleep_start_distribution' in sleep_patterns:
            sleep_start = sleep_patterns['sleep_start_distribution']
            if sleep_start:
                max_hour = max(sleep_start.items(), key=lambda x: x[1])[0]
                summary_text += f"・最も多い睡眠開始時間帯: {max_hour}時台\n"
        
        summary_text += "\n"
    
    # 成長データ
    if 'growth' in analysis_results and analysis_results['growth']:
        growth = analysis_results['growth']
        summary_text += "■ 成長データ\n"
        
        # 体重
        if 'weight_kg' in growth:
            weight = growth['weight_kg']
            first_weight = weight.get('first', 0)
            last_weight = weight.get('last', 0)
            change = weight.get('change', 0)
            
            summary_text += f"・体重: {first_weight:.2f}kg → {last_weight:.2f}kg (変化: {change:.2f}kg)\n"
        
        # 身長
        if 'height_cm' in growth:
            height = growth['height_cm']
            first_height = height.get('first', 0)
            last_height = height.get('last', 0)
            change = height.get('change', 0)
            
            summary_text += f"・身長: {first_height:.1f}cm → {last_height:.1f}cm (変化: {change:.1f}cm)\n"
        
        # 発熱日
        if 'fever_days' in growth and growth['fever_days']:
            fever_count = len(growth['fever_days'])
            summary_text += f"・発熱日数: {fever_count}日\n"
    
    return summary_text


def prepare_api_response(analysis_results: Dict[str, Any]) -> Dict[str, Any]:
    """
    分析結果をAPI応答形式に変換する

    Args:
        analysis_results: 分析結果の辞書

    Returns:
        API応答形式の辞書
    """
    # 時系列データの準備
    time_series_data = {}
    if 'time_series' in analysis_results and 'daily' in analysis_results['time_series']:
        daily_ts = analysis_results['time_series']['daily']
        
        # 睡眠時間の時系列
        if 'dates' in daily_ts and 'sleep_minutes' in daily_ts:
            time_series_data['sleep'] = {
                'labels': daily_ts['dates'],
                'data': [m / 60 for m in daily_ts['sleep_minutes']],  # 時間に変換
                'unit': '時間'
            }
        
        # ミルク摂取量の時系列
        if 'dates' in daily_ts and 'milk_amount' in daily_ts:
            time_series_data['milk'] = {
                'labels': daily_ts['dates'],
                'data': daily_ts['milk_amount'],
                'unit': 'ml'
            }
        
        # 吐く回数の時系列
        if 'dates' in daily_ts and 'vomit_count' in daily_ts:
            time_series_data['vomit'] = {
                'labels': daily_ts['dates'],
                'data': daily_ts['vomit_count'],
                'unit': '回'
            }
    
    # 時間帯別パターンの準備
    hourly_patterns = {}
    
    # 吐くイベントの時間帯分布
    if 'vomit_correlation' in analysis_results and 'vomit_hour_distribution' in analysis_results['vomit_correlation']:
        vomit_hours = analysis_results['vomit_correlation']['vomit_hour_distribution']
        hourly_patterns['vomit'] = {
            'labels': [f"{h}時" for h in range(24)],
            'data': [vomit_hours.get(str(h), 0) for h in range(24)],
            'unit': '回'
        }
    
    # 相関分析結果の準備
    correlations = []
    if 'vomit_correlation' in analysis_results:
        vomit_corr = analysis_results['vomit_correlation']
        
        # 相関係数のリスト
        corr_items = [
            ('milk_amount_vomit_count', 'ミルク摂取量と吐く回数'),
            ('sleep_minutes_vomit_count', '睡眠時間と吐く回数'),
            ('milk_count_vomit_count', 'ミルク回数と吐く回数'),
            ('pee_count_vomit_count', 'おしっこ回数と吐く回数'),
            ('poop_count_vomit_count', 'うんち回数と吐く回数')
        ]
        
        for key, label in corr_items:
            if key in vomit_corr:
                item = vomit_corr[key]
                correlations.append({
                    'label': label,
                    'value': item.get('correlation', 0),
                    'p_value': item.get('p_value', 1),
                    'significant': item.get('p_value', 1) < 0.05,
                    'strength': get_correlation_strength(item.get('correlation', 0))
                })
    
    # 成長データの準備
    growth_data = {}
    if 'growth' in analysis_results:
        growth = analysis_results['growth']
        
        # 体重データ
        if 'weight_kg' in growth and 'data' in growth['weight_kg']:
            weight_data = growth['weight_kg']['data']
            growth_data['weight'] = {
                'labels': [item[0].split('T')[0] for item in weight_data],  # 日付部分のみ抽出
                'data': [item[1] for item in weight_data],
                'unit': 'kg'
            }
        
        # 身長データ
        if 'height_cm' in growth and 'data' in growth['height_cm']:
            height_data = growth['height_cm']['data']
            growth_data['height'] = {
                'labels': [item[0].split('T')[0] for item in height_data],  # 日付部分のみ抽出
                'data': [item[1] for item in height_data],
                'unit': 'cm'
            }
    
    # サマリー統計の準備
    summary_stats = {}
    if 'daily_stats' in analysis_results:
        daily_stats = analysis_results['daily_stats']
        
        # 各指標の平均値
        for key in ['sleep_minutes', 'milk_amount', 'milk_count', 'pee_count', 'poop_count', 'vomit_count']:
            if key in daily_stats:
                stat = daily_stats[key]
                summary_stats[key] = {
                    'mean': stat.get('mean', 0),
                    'min': stat.get('min', 0),
                    'max': stat.get('max', 0),
                    'std': stat.get('std', 0)
                }
    
    # 要約テキストの生成
    summary_text = generate_summary_text(analysis_results)
    
    # API応答の構築
    api_response = {
        'summary': {
            'text': summary_text,
            'stats': summary_stats
        },
        'time_series': time_series_data,
        'hourly_patterns': hourly_patterns,
        'correlations': correlations,
        'growth': growth_data
    }
    
    return api_response
