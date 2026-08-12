#!/usr/bin/env python3
"""
GitHub APIからリポジトリ情報を取得して、JSONファイルに保存するスクリプト

使用方法:
    cd scripts
    export GITHUB_TOKEN=your_token_here  # プライベート確認・レート制限回避に推奨
    python fetch_repositories.py           # repositories.json を更新（公開リポのみ保存）
    python fetch_repositories.py --check   # 更新・分類状況だけ確認（ファイルは書かない）
    python fetch_repositories.py --include-private  # 非推奨: private も JSON に含める

出力:
    ../repositories.json - リポジトリ情報が保存されます（--check 時は出力なし）
"""

import argparse
import os
import json
import requests
import sys
from pathlib import Path
from typing import List, Dict, Set, Tuple
from datetime import datetime

# GitHub API設定
ACCOUNT_NAME = 'kwu-cms'
GITHUB_API_BASE = 'https://api.github.com'


def load_custom_descriptions() -> dict:
    """custom-descriptions.json を読み込む"""
    json_path = Path(__file__).parent.parent / 'custom-descriptions.json'
    if json_path.exists():
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def load_hidden_repos() -> List[str]:
    """custom-descriptions.json から非表示リポジトリ一覧を読み込む"""
    return load_custom_descriptions().get('hidden', [])


def load_classification_maps() -> Tuple[Dict[str, str], Dict[str, str], Dict[str, str], Set[str]]:
    """リポジトリ名 -> 授業/特設/ツール名、および hidden 集合を返す"""
    data = load_custom_descriptions()
    course_map: Dict[str, str] = {}
    event_map: Dict[str, str] = {}
    tool_map: Dict[str, str] = {}
    hidden = set(data.get('hidden', []))

    for course_name, course_info in (data.get('courses') or {}).items():
        for repo_name in (course_info.get('repositories') or {}):
            course_map[repo_name] = course_name

    for event_name, event_info in (data.get('events') or {}).items():
        for repo_name in (event_info.get('repositories') or {}):
            event_map[repo_name] = event_name

    for tool_name, tool_info in (data.get('tools') or {}).items():
        for repo_name in (tool_info.get('repositories') or {}):
            tool_map[repo_name] = tool_name

    return course_map, event_map, tool_map, hidden


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

    org_response = requests.get(f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}", headers=headers)
    if org_response.ok:
        print(f"  組織アカウントとして検出: {ACCOUNT_NAME}")
        return 'org'

    user_response = requests.get(f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}", headers=headers)
    if user_response.ok:
        print(f"  ユーザーアカウントとして検出: {ACCOUNT_NAME}")
        return 'user'

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
            if pages_data.get('html_url'):
                return pages_data['html_url']

        return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"
    except Exception as e:
        print(f"  ⚠️  [{repo_name}] GitHub Pages URLの取得に失敗: {e}")
        return f"https://{ACCOUNT_NAME}.github.io/{repo_name}"


def fetch_repositories_raw(headers: dict, account_type: str) -> List[Dict]:
    """GitHub APIからリポジトリ一覧を取得（ページネーション対応・フィルタ前）"""
    print(f"\nリポジトリ一覧を取得中: {ACCOUNT_NAME}...")

    rate_limit_response = requests.get(f"{GITHUB_API_BASE}/rate_limit", headers=headers)
    if rate_limit_response.ok:
        rate_limit_data = rate_limit_response.json()
        remaining = rate_limit_data['resources']['core']['remaining']
        reset_time = rate_limit_data['resources']['core']['reset']
        print(f"  GitHub APIレート制限: 残り{remaining}回")
        if remaining == 0:
            reset_datetime = datetime.fromtimestamp(reset_time)
            raise Exception(
                f"GitHub APIのレート制限に達しました。\n"
                f"リセット時刻: {reset_datetime.strftime('%Y-%m-%d %H:%M:%S')}"
            )

    endpoint = (
        f"{GITHUB_API_BASE}/orgs/{ACCOUNT_NAME}/repos"
        if account_type == 'org'
        else f"{GITHUB_API_BASE}/users/{ACCOUNT_NAME}/repos"
    )

    print(f"  APIエンドポイント: {endpoint}")
    repos: List[Dict] = []
    page = 1
    while page <= 10:
        response = requests.get(
            f"{endpoint}?per_page=100&sort=updated&type=all&page={page}",
            headers=headers
        )
        response.raise_for_status()
        batch = response.json()
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1

    return [repo for repo in repos if not repo.get('archived', False)]


def attach_pages_urls(repos: List[Dict], headers: dict) -> None:
    """has_pages のリポジトリに pages_url を付与"""
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


def load_snapshot(path: Path) -> dict:
    if not path.exists():
        return {'fetched_at': None, 'repositories': []}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {'fetched_at': None, 'repositories': []}


def print_status_report(live_repos: List[Dict], snapshot: dict) -> None:
    """更新・分類・可視性の状況を表示"""
    course_map, event_map, tool_map, hidden = load_classification_maps()
    snapshot_map = {r['name']: r for r in snapshot.get('repositories') or []}
    live_names = {r['name'] for r in live_repos}

    print("\n" + "=" * 60)
    print("リポジトリ状況レポート")
    print("=" * 60)
    print(f"ライブ取得: {len(live_repos)} 件")
    print(f"スナップショット: {len(snapshot_map)} 件"
          f"（取得時刻: {snapshot.get('fetched_at') or 'なし'}）")

    private_repos = [r for r in live_repos if r.get('private')]
    public_repos = [r for r in live_repos if not r.get('private')]
    print(f"  公開: {len(public_repos)} / Private: {len(private_repos)}")

    unclassified = []
    new_in_live = []
    updated = []
    visibility_changed = []

    for repo in live_repos:
        name = repo['name']
        if name in hidden:
            kind = 'hidden'
        elif name in course_map:
            kind = 'course'
        elif name in event_map:
            kind = 'event'
        elif name in tool_map:
            kind = 'tool'
        else:
            kind = 'unclassified'
            unclassified.append(name)

        snap = snapshot_map.get(name)
        if not snap:
            new_in_live.append(name)
        else:
            if snap.get('updated_at') != repo.get('updated_at'):
                updated.append(name)
            if bool(snap.get('private')) != bool(repo.get('private')):
                visibility_changed.append(name)

        vis = 'private' if repo.get('private') else 'public'
        pages = 'pages' if repo.get('has_pages') else 'no-pages'
        print(f"  - {name} [{vis}/{kind}/{pages}]")

    missing = [name for name in snapshot_map if name not in live_names]

    print("\n--- 要対応 ---")
    if unclassified:
        print(f"未分類（公開ページに出ません）: {', '.join(unclassified)}")
        print("  → custom-descriptions.json の courses / events / tools に追加")
    if private_repos:
        names = ', '.join(r['name'] for r in private_repos)
        print(f"Private: {names}")
        print("  → 公開するなら GitHub で public にしてから本スクリプトで更新")
        print("  → private は既定では repositories.json に書き込みません")
    if new_in_live:
        print(f"スナップショット未収録: {', '.join(new_in_live)}")
        print("  → 公開リポなら本スクリプト（引数なし）で更新")
    if updated:
        print(f"更新あり: {', '.join(updated)}")
    if visibility_changed:
        print(f"可視性変更: {', '.join(visibility_changed)}")
    if missing:
        print(f"APIに無し（削除・権限不足の可能性）: {', '.join(missing)}")
    if not any([unclassified, private_repos, new_in_live, updated, visibility_changed, missing]):
        print("対応が必要な項目はありません。")

    print("\nブラウザでも確認できます: admin.html")


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


def parse_args():
    parser = argparse.ArgumentParser(description='kwu-cms リポジトリ情報の取得・確認')
    parser.add_argument(
        '--check',
        action='store_true',
        help='状況確認のみ（repositories.json は更新しない）'
    )
    parser.add_argument(
        '--include-private',
        action='store_true',
        help='非推奨: private リポジトリも repositories.json に含める'
    )
    return parser.parse_args()


def main():
    """メイン処理"""
    args = parse_args()

    print("=" * 60)
    print("GitHubリポジトリ情報取得ツール")
    print("=" * 60)

    output_path = Path(__file__).parent.parent / 'repositories.json'
    headers = get_headers()

    if os.environ.get('GITHUB_TOKEN'):
        print("Personal Access Tokenを使用しています（レート制限: 5000回/時間）")
    else:
        print("認証なしで実行しています（レート制限: 60回/時間）")
        print("⚠️  プライベート確認・レート制限回避のため GITHUB_TOKEN の設定を推奨します")

    try:
        account_type = detect_account_type(headers)
        live_repos = fetch_repositories_raw(headers, account_type)
        hidden = set(load_hidden_repos())
        visible = [repo for repo in live_repos if repo['name'] not in hidden]

        print(f"取得したリポジトリ数: {len(live_repos)}個（hidden除外後の表示対象: {len(visible)}個）")

        snapshot = load_snapshot(output_path)

        if args.check:
            print_status_report(visible, snapshot)
            print("\n" + "=" * 60)
            print("確認完了（ファイルは更新していません）")
            print("=" * 60)
            return

        # 公開ページ用スナップショット: 既定では private を除外
        to_save = visible
        private_skipped = [r for r in to_save if r.get('private')]
        if not args.include_private:
            to_save = [r for r in to_save if not r.get('private')]
            if private_skipped:
                print("\n⚠️  次の private リポジトリは repositories.json に含めません:")
                for r in private_skipped:
                    print(f"    - {r['name']}")
                print("  （公開ページ用 JSON への漏洩を防ぐため。確認は --check または admin.html）")
        else:
            print("\n⚠️  --include-private 指定: private リポジトリも JSON に含めます")
            print("  公開リポジトリにコミットするとメタデータが公開される点に注意してください")

        attach_pages_urls(to_save, headers)
        save_repositories(to_save, output_path)
        print_status_report(visible, load_snapshot(output_path))

        print("\n" + "=" * 60)
        print("完了!")
        print("=" * 60)
        print(f"\n次のステップ:")
        print(f"1. {output_path} をGitにコミットしてください")
        print(f"2. 未分類があれば custom-descriptions.json を編集してください")
        print(f"3. ブラウザの admin.html でも状況を確認できます")

    except Exception as e:
        print(f"\n❌ エラー: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
