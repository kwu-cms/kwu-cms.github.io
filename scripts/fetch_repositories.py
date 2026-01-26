#!/usr/bin/env python3
"""
GitHub APIからリポジトリ情報を取得して、JSONファイルに保存するスクリプト

使用方法:
    cd scripts
    export GITHUB_TOKEN=your_token_here  # オプション（レート制限を回避するため推奨）
    python fetch_repositories.py

出力:
    ../repositories.json - リポジトリ情報が保存されます
"""

import os
import json
import requests
import sys
from pathlib import Path
from typing import List, Dict
from datetime import datetime

# GitHub API設定
ACCOUNT_NAME = 'kwu-cms'
GITHUB_API_BASE = 'https://api.github.com'

def get_headers() -> dict:
    """APIリクエスト用のヘッダーを取得"""
    headers = {
        'Accept': 'application/vnd.github.v3+json'
    }
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        headers['Authorization'] = f'token {token}'
    return headers

def detect_account_type(headers: dict) -> str:
    """アカウントタイプを自動検出"""
    print(f"アカウントタイプを検出中: {ACCOUNT_NAME}...")
    
    # まず組織として試す
    org_response = requests.get(f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}", headers=headers)
    if org_response.ok:
        print(f"  組織アカウントとして検出: {ACCOUNT_NAME}")
        return 'org'
    
    # 組織でなければユーザーとして試す
    user_response = requests.get(f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}", headers=headers)
    if user_response.ok:
        print(f"  ユーザーアカウントとして検出: {ACCOUNT_NAME}")
        return 'user'
    
    # どちらでもない場合はエラー
    raise Exception(f"アカウント '{ACCOUNT_NAME}' が見つかりませんでした。")

def get_pages_url(headers: dict, repo_name: str) -> str:
    """GitHub Pagesの公開URLを取得"""
    try:
        pages_response = requests.get(
            f"{GITHUB_API_BASE}/repos/{ACCOUNT_NAME}/{repo_name}/pages",
            headers=headers
        )
        
        if pages_response.ok:
            pages_data = pages_response.json()
            # html_urlフィールドがあればそれを使用
            if pages_data.get('html_url'):
                return pages_data['html_url']
        
        # Pages APIから取得できない場合、標準的なURLを生成
        # has_pagesがtrueの場合のみURLを生成
        return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"
    except Exception as e:
        # エラーが発生した場合も標準的なURLを生成
        print(f"  ⚠️  [{repo_name}] GitHub Pages URLの取得に失敗: {e}")
        return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"

def fetch_repositories(headers: dict, account_type: str) -> List[Dict]:
    """GitHub APIからリポジトリ一覧を取得"""
    print(f"\nリポジトリ一覧を取得中: {ACCOUNT_NAME}...")
    
    # レート制限を確認
    rate_limit_response = requests.get(f"{GITHUB_API_BASE}/rate_limit", headers=headers)
    if rate_limit_response.ok:
        rate_limit_data = rate_limit_response.json()
        remaining = rate_limit_data['resources']['core']['remaining']
        reset_time = rate_limit_data['resources']['core']['reset']
        print(f"  GitHub APIレート制限: 残り{remaining}回")
        if remaining == 0:
            import datetime
            reset_datetime = datetime.datetime.fromtimestamp(reset_time)
            raise Exception(f"GitHub APIのレート制限に達しました。\nリセット時刻: {reset_datetime.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # APIエンドポイントを決定
    endpoint = f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}/repos" if account_type == 'org' else f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}/repos"
    
    print(f"  APIエンドポイント: {endpoint}")
    response = requests.get(f"{endpoint}?per_page=100&sort=updated&type=all", headers=headers)
    response.raise_for_status()
    
    repos = response.json()
    # アーカイブされたリポジトリを除外
    repos = [repo for repo in repos if not repo.get('archived', False)]
    
    print(f"取得したリポジトリ数: {len(repos)}個")
    
    # 各リポジトリのGitHub Pages URLを取得
    print(f"\nGitHub Pagesの公開URLを取得中...")
    for i, repo in enumerate(repos, 1):
        repo_name = repo['name']
        has_pages = repo.get('has_pages', False)
        
        if has_pages:
            print(f"  [{i}/{len(repos)}] {repo_name}...", end=' ')
            pages_url = get_pages_url(headers, repo_name)
            repo['pages_url'] = pages_url
            print(f"✓ {pages_url}")
        else:
            repo['pages_url'] = None
    
    return repos

def save_repositories(repos: List[Dict], output_path: Path):
    """リポジトリ情報をJSONファイルに保存"""
    data = {
        'account_name': ACCOUNT_NAME,
        'fetched_at': datetime.now().isoformat(),
        'repositories': repos,
        'count': len(repos)
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ リポジトリ情報を保存しました: {output_path}")
    print(f"   リポジトリ数: {len(repos)}個")
    print(f"   取得時刻: {data['fetched_at']}")

def main():
    """メイン処理"""
    print("=" * 60)
    print("GitHubリポジトリ情報取得ツール")
    print("=" * 60)
    
    # 出力ファイルのパス
    output_path = Path(__file__).parent.parent / 'repositories.json'
    
    # ヘッダーを取得
    headers = get_headers()
    if os.environ.get('GITHUB_TOKEN'):
        print("Personal Access Tokenを使用しています（レート制限: 5000回/時間）")
    else:
        print("認証なしで実行しています（レート制限: 60回/時間）")
        print("⚠️  レート制限を回避するため、GITHUB_TOKEN環境変数の設定を推奨します")
    
    try:
        # アカウントタイプを検出
        account_type = detect_account_type(headers)
        
        # リポジトリ一覧を取得
        repos = fetch_repositories(headers, account_type)
        
        # JSONファイルに保存
        save_repositories(repos, output_path)
        
        print("\n" + "=" * 60)
        print("完了!")
        print("=" * 60)
        print(f"\n次のステップ:")
        print(f"1. {output_path} をGitにコミットしてください")
        print(f"2. script.jsが自動的にこのファイルを読み込みます")
        print(f"3. 定期的にこのスクリプトを実行して情報を更新してください")
        
    except Exception as e:
        print(f"\n❌ エラー: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
