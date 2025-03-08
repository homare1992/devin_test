#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
乳児活動記録テキストファイルのパーサー

このモジュールは、特定のフォーマットで記録された乳児の活動記録テキストファイルを
解析し、構造化されたデータに変換する機能を提供します。
"""

import re
import os
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional


class BabyLogParser:
    """乳児活動記録テキストファイルのパーサークラス"""

    def __init__(self, file_path: str):
        """
        パーサーの初期化

        Args:
            file_path: 解析対象のテキストファイルのパス
        """
        self.file_path = file_path
        self.raw_text = ""
        self.days_data = []
        self.events_df = None
        self.daily_summary_df = None
        self.growth_df = None

    def load_file(self) -> str:
        """
        テキストファイルを読み込む

        Returns:
            読み込んだテキストデータ
        """
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.raw_text = file.read()
            return self.raw_text
        except Exception as e:
            print(f"ファイル読み込みエラー: {e}")
            return ""

    def parse_days(self) -> List[Dict[str, Any]]:
        """
        テキストを日ごとのデータに分割して解析する

        Returns:
            日ごとのデータのリスト
        """
        if not self.raw_text:
            self.load_file()

        # 日付区切りのパターン
        day_pattern = r'----------\n(.*?)\n(.*?)\n\n(.*?)(?=\n----------|\Z)'
        day_matches = re.findall(day_pattern, self.raw_text, re.DOTALL)

        self.days_data = []
        for date_line, baby_info, day_content in day_matches:
            # 日付の解析
            date_match = re.match(r'(\d{4}/\d{1,2}/\d{1,2})\(.\)', date_line.strip())
            if date_match:
                date_str = date_match.group(1)
                date_obj = datetime.strptime(date_str, '%Y/%m/%d')
            else:
                continue

            # 赤ちゃん情報の解析
            baby_name = baby_info.strip()
            age_match = re.search(r'(\d+)歳(\d+)か月(\d+)日', baby_info)
            age_years, age_months, age_days = 0, 0, 0
            if age_match:
                age_years = int(age_match.group(1))
                age_months = int(age_match.group(2))
                age_days = int(age_match.group(3))

            # イベントの解析
            events = self._parse_events(day_content, date_obj)

            # 日次サマリーの解析
            summary = self._parse_daily_summary(day_content)

            # 日ごとのデータを追加
            day_data = {
                'date': date_obj,
                'date_str': date_str,
                'baby_name': baby_name,
                'age_years': age_years,
                'age_months': age_months,
                'age_days': age_days,
                'events': events,
                'summary': summary
            }
            self.days_data.append(day_data)

        return self.days_data

    def _parse_events(self, day_content: str, date_obj: datetime) -> List[Dict[str, Any]]:
        """
        日ごとのイベントを解析する

        Args:
            day_content: 1日分のテキストデータ
            date_obj: 日付オブジェクト

        Returns:
            イベントのリスト
        """
        events = []
        
        # サマリー部分を除外
        content_parts = day_content.split("\n\n母乳合計")
        if len(content_parts) > 0:
            events_content = content_parts[0]
        else:
            events_content = day_content
            
        # イベント行のパターン
        event_pattern = r'(\d{2}:\d{2})\s+(.*?)\s+(?:\((.*?)\))?\s*'
        event_matches = re.findall(event_pattern, events_content)
        
        for time_str, event_type, event_detail in event_matches:
            # 時間の解析
            try:
                # 標準的な時間形式（00:00-23:59）の場合
                time_obj = datetime.strptime(time_str, '%H:%M').time()
                event_datetime = datetime.combine(date_obj.date(), time_obj)
            except ValueError:
                # 24時間を超える時間形式（例：26:00）の場合
                hour, minute = map(int, time_str.split(':'))
                # 日付の調整（24時間以上は翌日として扱う）
                days_to_add = hour // 24
                adjusted_hour = hour % 24
                adjusted_time_str = f"{adjusted_hour:02d}:{minute:02d}"
                time_obj = datetime.strptime(adjusted_time_str, '%H:%M').time()
                adjusted_date = date_obj + timedelta(days=days_to_add)
                event_datetime = datetime.combine(adjusted_date.date(), time_obj)
            
            # イベントタイプと詳細の解析
            event_type = event_type.strip()
            event_detail = event_detail.strip() if event_detail else ""
            
            # 数値データの抽出
            value = None
            unit = None
            
            # ミルク量の抽出
            milk_match = re.search(r'(\d+)ml', event_type)
            if milk_match:
                value = int(milk_match.group(1))
                unit = 'ml'
                
            # 睡眠時間の抽出
            sleep_match = re.search(r'(\d+)時間(\d+)分', event_detail)
            if sleep_match:
                hours = int(sleep_match.group(1))
                minutes = int(sleep_match.group(2))
                value = hours * 60 + minutes  # 分単位に変換
                unit = 'minutes'
                
            # 体重の抽出
            weight_match = re.search(r'(\d+\.\d+)kg|(\d+)g', event_type)
            if weight_match:
                if weight_match.group(1):  # kg単位
                    value = float(weight_match.group(1))
                    unit = 'kg'
                elif weight_match.group(2):  # g単位
                    value = int(weight_match.group(2))
                    unit = 'g'
                    
            # 身長の抽出
            height_match = re.search(r'(\d+\.\d+)cm', event_type)
            if height_match:
                value = float(height_match.group(1))
                unit = 'cm'
                
            # 体温の抽出
            temp_match = re.search(r'(\d+\.\d+)°C', event_type)
            if temp_match:
                value = float(temp_match.group(1))
                unit = '°C'
                
            # 吐く量の抽出
            vomit_match = re.search(r'吐く\s+(極小|小|中|大)', event_type)
            if vomit_match:
                value_map = {'極小': 1, '小': 2, '中': 3, '大': 4}
                value = value_map.get(vomit_match.group(1), 0)
                unit = 'level'
            
            # イベントの分類
            category = self._categorize_event(event_type)
            
            event = {
                'datetime': event_datetime,
                'time': time_str,
                'type': event_type,
                'detail': event_detail,
                'category': category,
                'value': value,
                'unit': unit
            }
            events.append(event)
            
        return events

    def _categorize_event(self, event_type: str) -> str:
        """
        イベントタイプからカテゴリを判定する

        Args:
            event_type: イベントタイプの文字列

        Returns:
            イベントカテゴリ
        """
        if '起きる' in event_type:
            return 'wake'
        elif '寝る' in event_type:
            return 'sleep'
        elif 'ミルク' in event_type:
            return 'milk'
        elif '母乳' in event_type:
            return 'breastfeed'
        elif 'おしっこ' in event_type:
            return 'pee'
        elif 'うんち' in event_type:
            return 'poop'
        elif '吐く' in event_type:
            return 'vomit'
        elif 'お風呂' in event_type:
            return 'bath'
        elif '体重' in event_type:
            return 'weight'
        elif '身長' in event_type:
            return 'height'
        elif '体温' in event_type:
            return 'temperature'
        elif '病院' in event_type:
            return 'hospital'
        elif '予防接種' in event_type:
            return 'vaccination'
        elif '離乳食' in event_type:
            return 'food'
        elif 'くすり' in event_type:
            return 'medicine'
        elif '検査' in event_type or '処置' in event_type:
            return 'medical'
        elif '診察' in event_type:
            return 'examination'
        else:
            return 'other'

    def _parse_daily_summary(self, day_content: str) -> Dict[str, Any]:
        """
        日次サマリーを解析する

        Args:
            day_content: 1日分のテキストデータ

        Returns:
            日次サマリーデータ
        """
        summary = {
            'breastfeed_left': 0,
            'breastfeed_right': 0,
            'milk_count': 0,
            'milk_amount': 0,
            'sleep_minutes': 0,
            'pee_count': 0,
            'poop_count': 0
        }
        
        # サマリー部分を抽出
        summary_match = re.search(r'母乳合計.*?左\s+(\d+)分\s*/\s*右\s+(\d+)分\nミルク合計\s+(\d+)回\s+(\d+)ml\n睡眠合計\s+(\d+)時間(\d+)分\nおしっこ合計\s+(\d+)回\nうんち合計\s+(\d+)回', day_content, re.DOTALL)
        
        if summary_match:
            summary['breastfeed_left'] = int(summary_match.group(1))
            summary['breastfeed_right'] = int(summary_match.group(2))
            summary['milk_count'] = int(summary_match.group(3))
            summary['milk_amount'] = int(summary_match.group(4))
            
            sleep_hours = int(summary_match.group(5))
            sleep_minutes = int(summary_match.group(6))
            summary['sleep_minutes'] = sleep_hours * 60 + sleep_minutes
            
            summary['pee_count'] = int(summary_match.group(7))
            summary['poop_count'] = int(summary_match.group(8))
            
        return summary

    def create_events_dataframe(self) -> pd.DataFrame:
        """
        イベントデータをDataFrameに変換する

        Returns:
            イベントデータのDataFrame
        """
        if not self.days_data:
            self.parse_days()
            
        events_list = []
        for day in self.days_data:
            date = day['date']
            for event in day['events']:
                event_data = {
                    'date': date.date(),
                    'datetime': event['datetime'],
                    'time': event['time'],
                    'category': event['category'],
                    'type': event['type'],
                    'detail': event['detail'],
                    'value': event['value'],
                    'unit': event['unit'],
                    'baby_name': day['baby_name'],
                    'age_years': day['age_years'],
                    'age_months': day['age_months'],
                    'age_days': day['age_days']
                }
                events_list.append(event_data)
                
        self.events_df = pd.DataFrame(events_list)
        return self.events_df

    def create_daily_summary_dataframe(self) -> pd.DataFrame:
        """
        日次サマリーデータをDataFrameに変換する

        Returns:
            日次サマリーデータのDataFrame
        """
        if not self.days_data:
            self.parse_days()
            
        summary_list = []
        for day in self.days_data:
            summary_data = {
                'date': day['date'].date(),
                'baby_name': day['baby_name'],
                'age_years': day['age_years'],
                'age_months': day['age_months'],
                'age_days': day['age_days'],
                **day['summary']
            }
            
            # 吐くイベントのカウント
            vomit_events = [e for e in day['events'] if e['category'] == 'vomit']
            summary_data['vomit_count'] = len(vomit_events)
            
            # 吐く量の合計（レベルの合計）
            vomit_levels = [e['value'] for e in vomit_events if e['value'] is not None]
            summary_data['vomit_level_sum'] = sum(vomit_levels) if vomit_levels else 0
            
            summary_list.append(summary_data)
            
        self.daily_summary_df = pd.DataFrame(summary_list)
        return self.daily_summary_df

    def create_growth_dataframe(self) -> pd.DataFrame:
        """
        成長データをDataFrameに変換する

        Returns:
            成長データのDataFrame
        """
        if not self.days_data:
            self.parse_days()
            
        growth_list = []
        for day in self.days_data:
            date = day['date'].date()
            
            # 体重データの抽出
            weight_events = [e for e in day['events'] if e['category'] == 'weight']
            for event in weight_events:
                if event['value'] is not None:
                    growth_data = {
                        'date': date,
                        'datetime': event['datetime'],
                        'type': 'weight',
                        'value': event['value'],
                        'unit': event['unit'],
                        'baby_name': day['baby_name'],
                        'age_years': day['age_years'],
                        'age_months': day['age_months'],
                        'age_days': day['age_days']
                    }
                    growth_list.append(growth_data)
            
            # 身長データの抽出
            height_events = [e for e in day['events'] if e['category'] == 'height']
            for event in height_events:
                if event['value'] is not None:
                    growth_data = {
                        'date': date,
                        'datetime': event['datetime'],
                        'type': 'height',
                        'value': event['value'],
                        'unit': event['unit'],
                        'baby_name': day['baby_name'],
                        'age_years': day['age_years'],
                        'age_months': day['age_months'],
                        'age_days': day['age_days']
                    }
                    growth_list.append(growth_data)
                    
            # 体温データの抽出
            temp_events = [e for e in day['events'] if e['category'] == 'temperature']
            for event in temp_events:
                if event['value'] is not None:
                    growth_data = {
                        'date': date,
                        'datetime': event['datetime'],
                        'type': 'temperature',
                        'value': event['value'],
                        'unit': event['unit'],
                        'baby_name': day['baby_name'],
                        'age_years': day['age_years'],
                        'age_months': day['age_months'],
                        'age_days': day['age_days']
                    }
                    growth_list.append(growth_data)
            
        self.growth_df = pd.DataFrame(growth_list)
        return self.growth_df

    def parse_all(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        すべてのデータを解析してDataFrameを生成する

        Returns:
            イベントデータ、日次サマリーデータ、成長データのDataFrameのタプル
        """
        self.load_file()
        self.parse_days()
        events_df = self.create_events_dataframe()
        daily_summary_df = self.create_daily_summary_dataframe()
        growth_df = self.create_growth_dataframe()
        
        return events_df, daily_summary_df, growth_df

    def save_to_csv(self, output_dir: str) -> None:
        """
        解析結果をCSVファイルに保存する

        Args:
            output_dir: 出力ディレクトリのパス
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        if self.events_df is None or self.daily_summary_df is None or self.growth_df is None:
            self.parse_all()
            
        self.events_df.to_csv(os.path.join(output_dir, 'events.csv'), index=False, encoding='utf-8')
        self.daily_summary_df.to_csv(os.path.join(output_dir, 'daily_summary.csv'), index=False, encoding='utf-8')
        self.growth_df.to_csv(os.path.join(output_dir, 'growth.csv'), index=False, encoding='utf-8')


def main():
    """メイン関数"""
    # 入力ファイルのパス
    input_file = "../input/【ぴよログ】2024年2月.txt"
    
    # 出力ディレクトリ
    output_dir = "../data"
    
    # パーサーの初期化と実行
    parser = BabyLogParser(input_file)
    parser.parse_all()
    parser.save_to_csv(output_dir)
    
    print(f"解析完了: {input_file}")
    print(f"出力ディレクトリ: {output_dir}")


if __name__ == "__main__":
    main()
