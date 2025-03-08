#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
アナライザーのテストスクリプト
"""

import os
import sys
import json
from data_processing.parser import BabyLogParser
from data_processing.analyzer import BabyLogAnalyzer
from data_processing.utils import ensure_directory, save_json

def test_analyzer_initialization(data_dir):
    """アナライザーの初期化テスト"""
    print(f"アナライザー初期化テスト: {data_dir}")
    
    try:
        # CSVファイルの存在確認
        required_files = ['events.csv', 'daily_summary.csv', 'growth.csv']
        missing_files = []
        
        for file_name in required_files:
            file_path = os.path.join(data_dir, file_name)
            if not os.path.exists(file_path):
                missing_files.append(file_name)
        
        if missing_files:
            print(f"❌ 必要なCSVファイルが見つかりません: {', '.join(missing_files)}")
            return False
        
        # アナライザーの初期化
        analyzer = BabyLogAnalyzer()
        analyzer.load_data(data_dir)
        
        # データが読み込まれたか確認
        if analyzer.events_df is None:
            print("❌ イベントデータの読み込みに失敗しました")
            return False
        
        if analyzer.daily_summary_df is None:
            print("❌ 日次サマリーデータの読み込みに失敗しました")
            return False
        
        if analyzer.growth_df is None:
            print("❌ 成長データの読み込みに失敗しました")
            return False
        
        print(f"✅ アナライザー初期化成功")
        print(f"  イベント数: {len(analyzer.events_df)}")
        print(f"  日数: {len(analyzer.daily_summary_df)}")
        print(f"  成長記録数: {len(analyzer.growth_df)}")
        
        return True
    except Exception as e:
        print(f"❌ アナライザー初期化例外: {str(e)}")
        return False

def test_vomit_correlation(data_dir):
    """吐くイベントの相関分析テスト"""
    print(f"\n吐くイベント相関分析テスト: {data_dir}")
    
    try:
        analyzer = BabyLogAnalyzer()
        analyzer.load_data(data_dir)
        
        vomit_correlation = analyzer.analyze_vomit_correlation()
        
        if vomit_correlation:
            print(f"✅ 吐くイベント相関分析成功")
            
            # 主要な相関関係を表示
            if 'milk_amount_vomit_count' in vomit_correlation:
                corr = vomit_correlation['milk_amount_vomit_count']
                print(f"  ミルク摂取量と吐く回数の相関: {corr.get('correlation', 0):.3f}")
            
            if 'sleep_minutes_vomit_count' in vomit_correlation:
                corr = vomit_correlation['sleep_minutes_vomit_count']
                print(f"  睡眠時間と吐く回数の相関: {corr.get('correlation', 0):.3f}")
            
            if 'vomit_hour_distribution' in vomit_correlation:
                dist = vomit_correlation['vomit_hour_distribution']
                max_hour = max(dist.items(), key=lambda x: x[1])[0] if dist else None
                if max_hour:
                    print(f"  最も吐く回数が多い時間帯: {max_hour}時")
            
            return True
        else:
            print("❌ 吐くイベント相関分析失敗: 空の結果が返されました")
            return False
    except Exception as e:
        print(f"❌ 吐くイベント相関分析例外: {str(e)}")
        return False

def test_sleep_patterns(data_dir):
    """睡眠パターン分析テスト"""
    print(f"\n睡眠パターン分析テスト: {data_dir}")
    
    try:
        analyzer = BabyLogAnalyzer()
        analyzer.load_data(data_dir)
        
        sleep_patterns = analyzer.analyze_sleep_patterns()
        
        if sleep_patterns:
            print(f"✅ 睡眠パターン分析成功")
            
            # 主要な睡眠パターンを表示
            if 'daily_sleep_minutes' in sleep_patterns:
                stats = sleep_patterns['daily_sleep_minutes']
                print(f"  平均睡眠時間: {stats.get('mean', 0) / 60:.1f}時間")
            
            if 'sleep_fragmentation' in sleep_patterns:
                frag = sleep_patterns['sleep_fragmentation']
                print(f"  睡眠の断片化指数: {frag.get('mean', 0):.2f}")
            
            if 'sleep_start_distribution' in sleep_patterns:
                dist = sleep_patterns['sleep_start_distribution']
                max_hour = max(dist.items(), key=lambda x: x[1])[0] if dist else None
                if max_hour:
                    print(f"  最も多い睡眠開始時間帯: {max_hour}時")
            
            return True
        else:
            print("❌ 睡眠パターン分析失敗: 空の結果が返されました")
            return False
    except Exception as e:
        print(f"❌ 睡眠パターン分析例外: {str(e)}")
        return False

def test_comprehensive_analysis(data_dir, output_dir):
    """総合分析テスト"""
    print(f"\n総合分析テスト: {data_dir} -> {output_dir}")
    
    try:
        # 出力ディレクトリの確認
        ensure_directory(output_dir)
        
        analyzer = BabyLogAnalyzer()
        analyzer.load_data(data_dir)
        
        analysis_results = analyzer.get_comprehensive_analysis()
        
        if analysis_results:
            print(f"✅ 総合分析成功")
            
            # 結果をJSONに保存
            output_file = os.path.join(output_dir, 'analysis_results.json')
            save_json(analysis_results, output_file)
            
            # 保存されたファイルの確認
            if os.path.exists(output_file):
                file_size = os.path.getsize(output_file)
                print(f"✅ 分析結果の保存成功: {file_size} バイト")
                
                # 内容の一部を表示
                print("\n分析結果の一部:")
                
                if 'daily_stats' in analysis_results:
                    daily_stats = analysis_results['daily_stats']
                    if 'sleep_minutes' in daily_stats:
                        sleep_stats = daily_stats['sleep_minutes']
                        print(f"  平均睡眠時間: {sleep_stats.get('mean', 0) / 60:.1f}時間")
                    
                    if 'milk_amount' in daily_stats:
                        milk_stats = daily_stats['milk_amount']
                        print(f"  平均ミルク摂取量: {milk_stats.get('mean', 0):.0f}ml")
                
                return True
            else:
                print("❌ 分析結果の保存失敗: ファイルが存在しません")
                return False
        else:
            print("❌ 総合分析失敗: 空の結果が返されました")
            return False
    except Exception as e:
        print(f"❌ 総合分析例外: {str(e)}")
        return False

def main():
    """メイン関数"""
    # データディレクトリ
    data_dir = "data"
    
    # 出力ディレクトリ（同じディレクトリを使用）
    output_dir = data_dir
    
    # 各ステップのテスト
    init_ok = test_analyzer_initialization(data_dir)
    
    if init_ok:
        vomit_ok = test_vomit_correlation(data_dir)
        sleep_ok = test_sleep_patterns(data_dir)
        
        if vomit_ok and sleep_ok:
            analysis_ok = test_comprehensive_analysis(data_dir, output_dir)
            
            if analysis_ok:
                print("\n✅ すべてのテストが成功しました！")
            else:
                print("\n❌ 総合分析テストが失敗しました")
        else:
            print("\n❌ 個別分析テストが失敗しました")
    else:
        print("\n❌ アナライザー初期化テストが失敗しました")

if __name__ == "__main__":
    main()
