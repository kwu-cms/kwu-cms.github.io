#!/usr/bin/env python3
"""
GitHub Pagesの各プロジェクトページのスクリーンショットを自動生成するスクリプト

使用方法:
    pip install playwright requests
    playwright install chromium
    python generate_screenshots.py
"""

import os
import json
import requests
from pathlib import Path
from typing import List, Dict
import time

# Playwrightを使用する場合
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Playwrightがインストールされていません。'pip install playwright' を実行してください。")

# Seleniumを使用する場合（代替手段）
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

# 設定
ACCOUNT_NAME = 'kwu-cms'
GITHUB_API_BASE = 'https://api.github.com'
# 親ディレクトリのscreenshotsフォルダを使用
OUTPUT_DIR = Path(__file__).parent.parent / 'screenshots'
SCREENSHOT_WIDTH = 1920
SCREENSHOT_HEIGHT = 1080
WAIT_TIME = 3  # ページ読み込み待機時間（秒）

# Personal Access Token（オプション）
# レート制限を1時間あたり5000リクエストに増やすために設定できます
# 環境変数 GITHUB_TOKEN から読み込むか、直接設定してください
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')


def get_headers() -> dict:
    """APIリクエスト用のヘッダーを取得"""
    headers = {}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
    return headers

def fetch_repositories() -> List[Dict]:
    """GitHub APIからリポジトリ一覧を取得"""
    print(f"リポジトリ一覧を取得中: {ACCOUNT_NAME}...")
    
    headers = get_headers()
    if GITHUB_TOKEN:
        print(f"  Personal Access Tokenを使用しています（レート制限: 5000回/時間）")
    else:
        print(f"  認証なしで実行しています（レート制限: 60回/時間）")
    
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
            raise Exception(f"GitHub APIのレート制限に達しました。\nリセット時刻: {reset_datetime.strftime('%Y-%m-%d %H:%M:%S')}\nしばらく待ってから再度実行してください。")
    
    # アカウントタイプを自動検出
    print(f"  アカウントタイプを検出中...")
    org_response = requests.get(f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}", headers=headers)
    if org_response.ok:
        endpoint = f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}/repos"
        print(f"  組織アカウントとして検出: {ACCOUNT_NAME}")
    else:
        user_response = requests.get(f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}", headers=headers)
        if user_response.ok:
            endpoint = f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}/repos"
            print(f"  ユーザーアカウントとして検出: {ACCOUNT_NAME}")
        else:
            # 403エラーの場合はレート制限の可能性
            if org_response.status_code == 403 or user_response.status_code == 403:
                rate_limit_remaining = org_response.headers.get('X-RateLimit-Remaining', '不明')
                rate_limit_reset = org_response.headers.get('X-RateLimit-Reset', '不明')
                if rate_limit_reset != '不明':
                    import datetime
                    reset_datetime = datetime.datetime.fromtimestamp(int(rate_limit_reset))
                    reset_str = reset_datetime.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    reset_str = '不明'
                raise Exception(f"GitHub APIのレート制限に達した可能性があります。\n残り回数: {rate_limit_remaining}\nリセット時刻: {reset_str}\n\nまたは、アカウント '{ACCOUNT_NAME}' へのアクセス権限がない可能性があります。\nGitHubで https://github.com/{ACCOUNT_NAME} にアクセスして、アカウントが存在するか確認してください。")
            else:
                print(f"  エラー: 組織としてのステータス: {org_response.status_code}")
                print(f"  エラー: ユーザーとしてのステータス: {user_response.status_code}")
                raise Exception(f"アカウント '{ACCOUNT_NAME}' が見つかりませんでした。\nGitHubで https://github.com/{ACCOUNT_NAME} にアクセスして、アカウントが存在するか確認してください。")
    
    print(f"  APIエンドポイント: {endpoint}")
    response = requests.get(f"{endpoint}?per_page=100&sort=updated&type=all", headers=headers)
    response.raise_for_status()
    
    repos = response.json()
    # アーカイブされたリポジトリを除外
    repos = [repo for repo in repos if not repo.get('archived', False)]
    
    print(f"取得したリポジトリ数: {len(repos)}個")
    return repos


def load_repositories_from_json() -> Dict[str, Dict]:
    """repositories.jsonからリポジトリ情報を読み込み"""
    json_path = Path(__file__).parent.parent / 'repositories.json'
    if json_path.exists():
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                repos = data.get('repositories', [])
                # リポジトリ名をキーとした辞書を作成
                return {repo['name']: repo for repo in repos}
        except Exception as e:
            print(f"  repositories.jsonの読み込みに失敗: {e}")
    return {}

def get_pages_url(repo_name: str, repos_dict: Dict[str, Dict] = None) -> str:
    """GitHub PagesのURLを取得（repositories.jsonから優先的に取得）"""
    if repos_dict and repo_name in repos_dict:
        repo = repos_dict[repo_name]
        # pages_urlがあればそれを使用
        if repo.get('pages_url'):
            return repo['pages_url']
        # has_pagesがtrueの場合は標準URLを生成
        if repo.get('has_pages'):
            return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"
    # フォールバック: 標準的なURLを生成
    return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"


def generate_screenshot_playwright(url: str, output_path: str) -> bool:
    """Playwrightを使用してスクリーンショットを生成"""
    if not PLAYWRIGHT_AVAILABLE:
        return False
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': SCREENSHOT_WIDTH, 'height': SCREENSHOT_HEIGHT})
            
            print(f"  アクセス中: {url}")
            page.goto(url, wait_until='networkidle', timeout=30000)
            
            # ページが完全に読み込まれるまで待機
            time.sleep(WAIT_TIME)
            
            # スクリーンショットを保存
            page.screenshot(path=output_path, full_page=False)
            browser.close()
            
            print(f"  ✓ 保存完了: {output_path}")
            return True
    except Exception as e:
        print(f"  ✗ エラー: {e}")
        return False


def generate_screenshot_selenium(url: str, output_path: str) -> bool:
    """Seleniumを使用してスクリーンショットを生成"""
    if not SELENIUM_AVAILABLE:
        return False
    
    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument(f'--window-size={SCREENSHOT_WIDTH},{SCREENSHOT_HEIGHT}')
        
        driver = webdriver.Chrome(options=options)
        driver.set_window_size(SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT)
        
        print(f"  アクセス中: {url}")
        driver.get(url)
        
        # ページが完全に読み込まれるまで待機
        time.sleep(WAIT_TIME)
        
        # スクリーンショットを保存
        driver.save_screenshot(output_path)
        driver.quit()
        
        print(f"  ✓ 保存完了: {output_path}")
        return True
    except Exception as e:
        print(f"  ✗ エラー: {e}")
        return False


def check_pages_exists(url: str, verbose: bool = False) -> bool:
    """GitHub Pagesが存在するか確認"""
    try:
        # User-Agentを設定してGitHub Pagesのブロックを回避
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        # リダイレクトを許可してチェック（GitHub Pagesはリダイレクトすることがある）
        response = requests.get(url, timeout=10, allow_redirects=True, headers=headers)
        
        if verbose:
            print(f"    ステータスコード: {response.status_code}")
            print(f"    最終URL: {response.url}")
        
        # 200-299のステータスコードを成功とみなす
        # 404以外は存在するとみなす（403なども存在する可能性がある）
        exists = response.status_code != 404
        
        if verbose and not exists:
            print(f"    404エラー: ページが存在しません")
        
        return exists
    except requests.exceptions.Timeout:
        if verbose:
            print(f"    タイムアウト: {url}")
        return False
    except requests.exceptions.RequestException as e:
        if verbose:
            print(f"    リクエストエラー: {e}")
        return False
    except Exception as e:
        if verbose:
            print(f"    予期しないエラー: {e}")
        return False


def main():
    """メイン処理"""
    import sys
    
    # コマンドライン引数をチェック
    skip_check = '--skip-check' in sys.argv or '--force' in sys.argv
    force_overwrite = '--force' in sys.argv
    
    # 特定のリポジトリ名を指定（例: --repo programming-b-web）
    target_repo = None
    if '--repo' in sys.argv:
        repo_index = sys.argv.index('--repo')
        if repo_index + 1 < len(sys.argv):
            target_repo = sys.argv[repo_index + 1]
    
    print("=" * 60)
    print("GitHub Pages スクリーンショット生成ツール")
    print("=" * 60)
    
    if skip_check:
        print("⚠️  存在確認をスキップします（--skip-check）")
        print()
    if force_overwrite:
        print("⚠️  既存のファイルを上書きします（--force）")
        print()
    if target_repo:
        print(f"🎯 対象リポジトリ: {target_repo}")
        print()
    
    # 出力ディレクトリを作成
    output_dir = OUTPUT_DIR
    output_dir.mkdir(exist_ok=True, parents=True)
    
    # repositories.jsonからリポジトリ情報を読み込み（pages_urlを含む）
    repos_dict = load_repositories_from_json()
    
    # リポジトリ一覧を取得
    if target_repo:
        # 特定のリポジトリのみを処理する場合
        if repos_dict and target_repo in repos_dict:
            repos = [repos_dict[target_repo]]
        else:
            repos = [{'name': target_repo}]
    else:
        # repositories.jsonから読み込むか、APIから取得
        if repos_dict:
            repos = list(repos_dict.values())
            print(f"repositories.jsonから {len(repos)}個のリポジトリを読み込みました")
        else:
            repos = fetch_repositories()
    
    # 使用可能な方法を確認
    # Playwrightが利用可能でブラウザがインストールされているか確認
    use_playwright = False
    if PLAYWRIGHT_AVAILABLE:
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                browser.close()
            use_playwright = True
        except Exception as e:
            print(f"  Playwrightのブラウザがインストールされていないようです。")
            print(f"  自動インストールを試みます...")
            try:
                import subprocess
                result = subprocess.run(['python3', '-m', 'playwright', 'install', 'chromium'], 
                                      capture_output=True, text=True, timeout=300)
                if result.returncode == 0:
                    print(f"  ✓ Playwrightのブラウザをインストールしました")
                    # 再度試す
                    with sync_playwright() as p:
                        browser = p.chromium.launch(headless=True)
                        browser.close()
                    use_playwright = True
                else:
                    print(f"  ✗ インストールに失敗しました: {result.stderr}")
                    print(f"  手動で実行してください: playwright install chromium")
            except Exception as install_error:
                print(f"  ✗ 自動インストールに失敗しました: {install_error}")
                print(f"  手動で実行してください: playwright install chromium")
            use_playwright = False
    
    use_selenium = SELENIUM_AVAILABLE and not use_playwright
    
    if not use_playwright and not use_selenium:
        print("\nエラー: PlaywrightまたはSeleniumがインストールされていません。")
        print("インストール方法:")
        print("  Playwright: pip install playwright && playwright install chromium")
        print("  Selenium: pip install selenium")
        return
    
    print(f"\n使用する方法: {'Playwright' if use_playwright else 'Selenium'}")
    print(f"出力ディレクトリ: {output_dir.absolute()}")
    print(f"スクリーンショットサイズ: {SCREENSHOT_WIDTH}x{SCREENSHOT_HEIGHT}px\n")
    
    # 各リポジトリのスクリーンショットを生成
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for repo in repos:
        repo_name = repo['name']
        pages_url = get_pages_url(repo_name, repos_dict)
        output_path = output_dir / f"{repo_name}.png"
        
        print(f"\n[{repo_name}]")
        
        # 既にスクリーンショットが存在する場合はスキップ（--forceオプションで上書き可能）
        if output_path.exists() and not force_overwrite:
            print(f"  スキップ: 既に存在します ({output_path})")
            print(f"  → 上書きする場合は --force オプションを使用してください")
            skip_count += 1
            continue
        elif output_path.exists() and force_overwrite:
            print(f"  上書き: 既存のファイルを更新します ({output_path})")
        
        # GitHub Pagesが存在するか確認（--skip-checkオプションでスキップ可能）
        if skip_check:
            print(f"  存在確認をスキップ: スクリーンショットを生成します")
        else:
            pages_exists = check_pages_exists(pages_url, verbose=True)
            if not pages_exists:
                print(f"  スキップ: GitHub Pagesが存在しないか、アクセスできません ({pages_url})")
                print(f"  → 手動でブラウザで確認してください。存在する場合は、--skip-check オプションでスキップできます。")
                print(f"  → 例: python generate_screenshots.py --repo {repo_name} --skip-check")
                skip_count += 1
                continue
        
        # スクリーンショットを生成
        if use_playwright:
            success = generate_screenshot_playwright(pages_url, str(output_path))
        else:
            success = generate_screenshot_selenium(pages_url, str(output_path))
        
        if success:
            success_count += 1
        else:
            error_count += 1
        
        # APIレート制限を避けるため、少し待機
        time.sleep(1)
    
    # 結果を表示
    print("\n" + "=" * 60)
    print("完了!")
    print(f"成功: {success_count}個")
    print(f"スキップ: {skip_count}個")
    print(f"エラー: {error_count}個")
    print(f"出力ディレクトリ: {output_dir.absolute()}")
    print("=" * 60)
    
    # 各プロジェクトのリポジトリに画像を配置する手順を表示
    if success_count > 0:
        print("\n次のステップ:")
        print("1. 生成されたスクリーンショットを各プロジェクトのリポジトリに配置してください")
        print("2. ファイル名を 'screenshot.png' または 'og-image.png' にリネーム")
        print("3. リポジトリのルートまたは 'images/' フォルダに配置")
        print("4. コミット・プッシュ")


if __name__ == '__main__':
    main()
