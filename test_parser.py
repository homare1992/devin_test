#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
パーサーのテストスクリプト
"""

import os
import sys
from data_processing.parser import BabyLogParser
from data_processing.utils import ensure_directory

def test_file_loading(file_path):
    """ファイル読み込みのテスト"""
    print(f"ファイル読み込みテスト: {file_path}")
    
    try:
        parser = BabyLogParser(file_path)
        raw_text = parser.load_file()
        
        if raw_text:
            print(f"✅ ファイル読み込み成功: {len(raw_text)} 文字")
            print(f"最初の100文字: {raw_text[:100]}...")
            return True
        else:
            print("❌ ファイル読み込み失敗: 空のテキストが返されました")
            return False
    except Exception as e:
        print(f"❌ ファイル読み込み例外: {str(e)}")
        return False

def test_parsing(file_path):
    """パース処理のテスト"""
    print(f"\nパース処理テスト: {file_path}")
    
    try:
        parser = BabyLogParser(file_path)
        days_data = parser.parse_days()
        
        if days_data:
            print(f"✅ パース成功: {len(days_data)} 日分のデータ")
            
            # 最初の日のデータを表示
            if len(days_data) > 0:
                first_day = days_data[0]
                print(f"最初の日: {first_day['date_str']}")
                print(f"赤ちゃん: {first_day['baby_name']}")
                print(f"イベント数: {len(first_day['events'])}")
                
                # 最初のイベントを表示
                if len(first_day['events']) > 0:
                    first_event = first_day['events'][0]
                    print(f"最初のイベント: {first_event['time']} {first_event['type']}")
            
            return True
        else:
            print("❌ パース失敗: 空のデータが返されました")
            return False
    except Exception as e:
        print(f"❌ パース例外: {str(e)}")
        return False

def test_dataframe_creation(file_path):
    """DataFrameの作成テスト"""
    print(f"\nDataFrame作成テスト: {file_path}")
    
    try:
        parser = BabyLogParser(file_path)
        events_df, daily_summary_df, growth_df = parser.parse_all()
        
        if events_df is not None:
            print(f"✅ イベントDataFrame作成成功: {len(events_df)} 行")
            print(f"カラム: {', '.join(events_df.columns)}")
        else:
            print("❌ イベントDataFrame作成失敗")
            return False
        
        if daily_summary_df is not None:
            print(f"✅ 日次サマリーDataFrame作成成功: {len(daily_summary_df)} 行")
            print(f"カラム: {', '.join(daily_summary_df.columns)}")
        else:
            print("❌ 日次サマリーDataFrame作成失敗")
            return False
        
        if growth_df is not None:
            print(f"✅ 成長DataFrame作成成功: {len(growth_df)} 行")
            print(f"カラム: {', '.join(growth_df.columns)}")
        else:
            print("❌ 成長DataFrame作成失敗")
            return False
        
        return True
    except Exception as e:
        print(f"❌ DataFrame作成例外: {str(e)}")
        return False

def test_csv_saving(file_path, output_dir):
    """CSV保存テスト"""
    print(f"\nCSV保存テスト: {file_path} -> {output_dir}")
    
    try:
        # 出力ディレクトリの確認
        ensure_directory(output_dir)
        
        parser = BabyLogParser(file_path)
        parser.parse_all()
        parser.save_to_csv(output_dir)
        
        # 保存されたファイルの確認
        expected_files = ['events.csv', 'daily_summary.csv', 'growth.csv']
        all_exist = True
        
        for file_name in expected_files:
            file_path = os.path.join(output_dir, file_name)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"✅ {file_name} 保存成功: {file_size} バイト")
            else:
                print(f"❌ {file_name} 保存失敗: ファイルが存在しません")
                all_exist = False
        
        return all_exist
    except Exception as e:
        print(f"❌ CSV保存例外: {str(e)}")
        return False

def main():
    """メイン関数"""
    # テスト対象のファイルパス
    file_path = "input/piyolog_202402.txt"
    
    # 出力ディレクトリ
    output_dir = "data"
    
    # 各ステップのテスト
    file_loaded = test_file_loading(file_path)
    
    if file_loaded:
        parsing_ok = test_parsing(file_path)
        
        if parsing_ok:
            df_ok = test_dataframe_creation(file_path)
            
            if df_ok:
                csv_ok = test_csv_saving(file_path, output_dir)
                
                if csv_ok:
                    print("\n✅ すべてのテストが成功しました！")
                else:
                    print("\n❌ CSV保存テストが失敗しました")
            else:
                print("\n❌ DataFrame作成テストが失敗しました")
        else:
            print("\n❌ パース処理テストが失敗しました")
    else:
        print("\n❌ ファイル読み込みテストが失敗しました")

if __name__ == "__main__":
    main()
