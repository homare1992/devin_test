#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
乳児活動記録分析・可視化Webアプリの設定ファイル

このモジュールは、Flaskアプリケーションの設定を提供します。
"""

import os

# 基本ディレクトリ
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# データディレクトリ
DATA_DIR = os.path.join(BASE_DIR, 'data')

# 入力ディレクトリ
INPUT_DIR = os.path.join(BASE_DIR, 'input')

# デフォルトのログファイル
DEFAULT_LOG_FILE = os.path.join(INPUT_DIR, '【ぴよログ】2024年2月.txt')

# フロントエンドのビルドディレクトリ
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, 'frontend', 'build')


class Config:
    """基本設定クラス"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-for-baby-log-app'
    
    # CORSの設定
    CORS_HEADERS = 'Content-Type'
    
    # JSONの設定
    JSON_AS_ASCII = False
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    """開発環境の設定クラス"""
    DEBUG = True
    
    # 開発用のCORS設定
    CORS_ORIGINS = [
        'http://localhost:3000',  # React開発サーバー
        'http://127.0.0.1:3000'
    ]


class TestingConfig(Config):
    """テスト環境の設定クラス"""
    TESTING = True
    DEBUG = True


class ProductionConfig(Config):
    """本番環境の設定クラス"""
    # 本番環境固有の設定
    pass


# 環境に応じた設定の選択
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# 現在の環境設定を取得
def get_config():
    """現在の環境に応じた設定を取得する"""
    env = os.environ.get('FLASK_ENV') or 'default'
    return config[env]
