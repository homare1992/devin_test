#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
乳児活動記録分析・可視化Webアプリのバックエンド

このモジュールは、Flask RESTful APIを提供し、データ処理モジュールと連携して
乳児の活動記録データの分析結果を提供します。
"""

import os
import sys
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
from datetime import datetime

# データ処理モジュールのパスを追加
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# データ処理モジュールのインポート
from data_processing.parser import BabyLogParser
from data_processing.analyzer import BabyLogAnalyzer
from data_processing.utils import ensure_directory, save_json, load_json, prepare_api_response

# Flaskアプリケーションの初期化
app = Flask(__name__)
CORS(app)  # CORS対応

# 設定
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
INPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'input')
DEFAULT_LOG_FILE = os.path.join(INPUT_DIR, 'piyolog_202402.txt')

# データディレクトリの確保
ensure_directory(DATA_DIR)


@app.route('/api/health', methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/parse', methods=['POST'])
def parse_data():
    """
    テキストデータを解析するエンドポイント
    
    リクエストボディ:
    {
        "file_path": "ファイルパス（省略時はデフォルトファイル）"
    }
    """
    try:
        data = request.get_json() or {}
        file_path = data.get('file_path', DEFAULT_LOG_FILE)
        
        # パーサーの初期化と実行
        parser = BabyLogParser(file_path)
        events_df, daily_summary_df, growth_df = parser.parse_all()
        
        # 結果をCSVに保存
        parser.save_to_csv(DATA_DIR)
        
        return jsonify({
            'status': 'success',
            'message': 'データ解析が完了しました',
            'data': {
                'events_count': len(events_df),
                'days_count': len(daily_summary_df),
                'growth_records': len(growth_df)
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'データ解析エラー: {str(e)}'
        }), 500


@app.route('/api/analyze', methods=['GET'])
def analyze_data():
    """データを分析するエンドポイント"""
    try:
        # 分析クラスの初期化
        analyzer = BabyLogAnalyzer()
        
        # データの読み込み
        analyzer.load_data(DATA_DIR)
        
        # 総合分析の実行
        analysis_results = analyzer.get_comprehensive_analysis()
        
        # 結果をJSONに保存
        save_json(analysis_results, os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # API応答形式に変換
        api_response = prepare_api_response(analysis_results)
        
        return jsonify({
            'status': 'success',
            'message': '分析が完了しました',
            'data': api_response
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'分析エラー: {str(e)}'
        }), 500


@app.route('/api/events', methods=['GET'])
def get_events():
    """イベントデータを取得するエンドポイント"""
    try:
        # クエリパラメータの取得
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # CSVからデータを読み込む
        events_df = pd.read_csv(
            os.path.join(DATA_DIR, 'events.csv'),
            parse_dates=['date', 'datetime']
        )
        
        # カテゴリでフィルタリング
        if category:
            events_df = events_df[events_df['category'] == category]
        
        # 日付範囲でフィルタリング
        if start_date:
            start_date = pd.to_datetime(start_date)
            events_df = events_df[events_df['date'] >= start_date]
        
        if end_date:
            end_date = pd.to_datetime(end_date)
            events_df = events_df[events_df['date'] <= end_date]
        
        # 結果をJSON形式に変換
        events_data = events_df.to_dict(orient='records')
        
        return jsonify({
            'status': 'success',
            'count': len(events_data),
            'data': events_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'イベントデータ取得エラー: {str(e)}'
        }), 500


@app.route('/api/summary/daily', methods=['GET'])
def get_daily_summary():
    """日次サマリーデータを取得するエンドポイント"""
    try:
        # クエリパラメータの取得
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # CSVからデータを読み込む
        daily_df = pd.read_csv(
            os.path.join(DATA_DIR, 'daily_summary.csv'),
            parse_dates=['date']
        )
        
        # 日付範囲でフィルタリング
        if start_date:
            start_date = pd.to_datetime(start_date)
            daily_df = daily_df[daily_df['date'] >= start_date]
        
        if end_date:
            end_date = pd.to_datetime(end_date)
            daily_df = daily_df[daily_df['date'] <= end_date]
        
        # 結果をJSON形式に変換
        daily_data = daily_df.to_dict(orient='records')
        
        return jsonify({
            'status': 'success',
            'count': len(daily_data),
            'data': daily_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'日次サマリーデータ取得エラー: {str(e)}'
        }), 500


@app.route('/api/growth', methods=['GET'])
def get_growth_data():
    """成長データを取得するエンドポイント"""
    try:
        # クエリパラメータの取得
        data_type = request.args.get('type')  # 'weight', 'height', 'temperature'
        
        # CSVからデータを読み込む
        growth_df = pd.read_csv(
            os.path.join(DATA_DIR, 'growth.csv'),
            parse_dates=['date', 'datetime']
        )
        
        # タイプでフィルタリング
        if data_type:
            growth_df = growth_df[growth_df['type'] == data_type]
        
        # 結果をJSON形式に変換
        growth_data = growth_df.to_dict(orient='records')
        
        return jsonify({
            'status': 'success',
            'count': len(growth_data),
            'data': growth_data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'成長データ取得エラー: {str(e)}'
        }), 500


@app.route('/api/analysis/vomit-correlation', methods=['GET'])
def get_vomit_correlation():
    """「吐く」イベントの相関分析結果を取得するエンドポイント"""
    try:
        # 分析結果をJSONから読み込む
        analysis_results = load_json(os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # 「吐く」イベントの相関分析結果を抽出
        vomit_correlation = analysis_results.get('vomit_correlation', {})
        
        return jsonify({
            'status': 'success',
            'data': vomit_correlation
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'相関分析結果取得エラー: {str(e)}'
        }), 500


@app.route('/api/analysis/sleep-patterns', methods=['GET'])
def get_sleep_patterns():
    """睡眠パターン分析結果を取得するエンドポイント"""
    try:
        # 分析結果をJSONから読み込む
        analysis_results = load_json(os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # 睡眠パターン分析結果を抽出
        sleep_patterns = analysis_results.get('sleep_patterns', {})
        
        return jsonify({
            'status': 'success',
            'data': sleep_patterns
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'睡眠パターン分析結果取得エラー: {str(e)}'
        }), 500


@app.route('/api/analysis/feeding-patterns', methods=['GET'])
def get_feeding_patterns():
    """食事パターン分析結果を取得するエンドポイント"""
    try:
        # 分析結果をJSONから読み込む
        analysis_results = load_json(os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # 食事パターン分析結果を抽出
        feeding_patterns = analysis_results.get('feeding_patterns', {})
        
        return jsonify({
            'status': 'success',
            'data': feeding_patterns
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'食事パターン分析結果取得エラー: {str(e)}'
        }), 500


@app.route('/api/analysis/comprehensive', methods=['GET'])
def get_comprehensive_analysis():
    """総合分析結果を取得するエンドポイント"""
    try:
        # 分析結果をJSONから読み込む
        analysis_results = load_json(os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # API応答形式に変換
        api_response = prepare_api_response(analysis_results)
        
        return jsonify({
            'status': 'success',
            'data': api_response
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'総合分析結果取得エラー: {str(e)}'
        }), 500


@app.route('/api/data/csv/<filename>', methods=['GET'])
def get_csv_data(filename):
    """CSVデータを取得するエンドポイント"""
    try:
        # 許可されたファイル名のリスト
        allowed_files = ['events.csv', 'daily_summary.csv', 'growth.csv']
        
        if filename not in allowed_files:
            return jsonify({
                'status': 'error',
                'message': '無効なファイル名です'
            }), 400
        
        return send_from_directory(DATA_DIR, filename, as_attachment=True)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'CSVデータ取得エラー: {str(e)}'
        }), 500


@app.route('/api/process', methods=['POST'])
def process_data():
    """
    データの解析と分析を一括で実行するエンドポイント
    
    リクエストボディ:
    {
        "file_path": "ファイルパス（省略時はデフォルトファイル）"
    }
    """
    try:
        data = request.get_json() or {}
        file_path = data.get('file_path', DEFAULT_LOG_FILE)
        
        # 1. パーサーの初期化と実行
        parser = BabyLogParser(file_path)
        events_df, daily_summary_df, growth_df = parser.parse_all()
        
        # 結果をCSVに保存
        parser.save_to_csv(DATA_DIR)
        
        # 2. 分析クラスの初期化
        analyzer = BabyLogAnalyzer(events_df, daily_summary_df, growth_df)
        
        # 3. 総合分析の実行
        analysis_results = analyzer.get_comprehensive_analysis()
        
        # 結果をJSONに保存
        save_json(analysis_results, os.path.join(DATA_DIR, 'analysis_results.json'))
        
        # API応答形式に変換
        api_response = prepare_api_response(analysis_results)
        
        return jsonify({
            'status': 'success',
            'message': 'データ処理が完了しました',
            'data': {
                'events_count': len(events_df),
                'days_count': len(daily_summary_df),
                'growth_records': len(growth_df),
                'analysis': api_response
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'データ処理エラー: {str(e)}'
        }), 500


# 静的ファイルの提供（フロントエンドのビルド成果物）
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    """
    静的ファイルを提供するエンドポイント
    フロントエンドのビルド成果物を提供します
    """
    static_folder = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')
    
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')


if __name__ == '__main__':
    # 開発サーバーの起動
    app.run(debug=True, host='0.0.0.0', port=5000)
