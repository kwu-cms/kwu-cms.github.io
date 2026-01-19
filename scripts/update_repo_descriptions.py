#!/usr/bin/env python3
"""
custom-descriptions.jsonの内容を使って、GitHubの各リポジトリの説明を更新するスクリプト

使用方法:
    python update_repo_descriptions.py

環境変数:
    GITHUB_TOKEN: GitHub Personal Access Token (repoスコープが必要)
    または、実行時にトークンの入力を求められます
"""

import os
import json
import requests
import sys
from pathlib import Path
from typing import Dict

# GitHub API設定
ACCOUNT_NAME = 'kwu-cms'
GITHUB_API_BASE = 'https://api.github.com'

def load_custom_descriptions() -> Dict[str, str]:
    """custom-descriptions.jsonを読み込む"""
    # 親ディレクトリのcustom-descriptions.jsonを読み込む
    json_path = Path(__file__).parent.parent / 'custom-descriptions.json'
    
    if not json_path.exists():
        print(f"エラー: {json_path} が見つかりません。")
        sys.exit(1)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data.get('descriptions', {})

def get_github_token() -> str:
    """GitHubトークンを取得（環境変数または入力）"""
    token = os.environ.get('GITHUB_TOKEN')
    
    if not token:
        # 非対話モードの場合はエラー
        if not sys.stdin.isatty():
            print("エラー: 非対話モードでは環境変数 GITHUB_TOKEN が必要です。")
            sys.exit(1)
        
        print("GitHub Personal Access Tokenが必要です。")
        print("環境変数 GITHUB_TOKEN を設定するか、以下に入力してください。")
        token = input("GitHub Token: ").strip()
    
    if not token:
        print("エラー: トークンが入力されませんでした。")
        sys.exit(1)
    
    return token

def update_repo_description(repo_name: str, description: str, token: str) -> bool:
    """GitHub APIを使ってリポジトリの説明を更新"""
    url = f"{GITHUB_API_BASE}/repos/{ACCOUNT_NAME}/{repo_name}"
    
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
    
    data = {
        'description': description
    }
    
    try:
        response = requests.patch(url, headers=headers, json=data)
        
        if response.status_code == 200:
            print(f"✅ [{repo_name}] 説明を更新しました")
            return True
        else:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('message', 'Unknown error')
            print(f"❌ [{repo_name}] 更新に失敗: {error_msg} (ステータス: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ [{repo_name}] エラー: {e}")
        return False

def main():
    """メイン処理"""
    print("=" * 60)
    print("GitHubリポジトリの説明を更新します")
    print("=" * 60)
    print()
    
    # JSONファイルを読み込み
    descriptions = load_custom_descriptions()
    
    if not descriptions:
        print("警告: custom-descriptions.jsonに説明がありません。")
        sys.exit(0)
    
    print(f"更新対象: {len(descriptions)}個のリポジトリ")
    print()
    
    # リポジトリ名のリストを表示
    for repo_name in descriptions.keys():
        print(f"  - {repo_name}")
    print()
    
    # 確認（非対話モードの場合はスキップ）
    if sys.stdin.isatty():
        confirm = input("続行しますか？ (y/N): ").strip().lower()
        if confirm != 'y':
            print("キャンセルしました。")
            sys.exit(0)
    else:
        print("非対話モードで実行します...")
    
    # トークンを取得
    token = get_github_token()
    print()
    
    # 各リポジトリの説明を更新
    success_count = 0
    fail_count = 0
    
    for repo_name, description in descriptions.items():
        if update_repo_description(repo_name, description, token):
            success_count += 1
        else:
            fail_count += 1
    
    print()
    print("=" * 60)
    print(f"完了: {success_count}個成功, {fail_count}個失敗")
    print("=" * 60)

if __name__ == '__main__':
    main()
