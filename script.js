// GitHub API設定
const ACCOUNT_NAME = 'kwu-cms'; // ユーザーアカウントまたは組織名
const GITHUB_API_BASE = 'https://api.github.com';
const ACCOUNT_TYPE = 'auto'; // 'user', 'org', または 'auto'（自動検出）

// グローバル変数
let allRepos = [];
let screenshotMap = {}; // スクリーンショット画像のマッピング（リポジトリ名 -> 画像パス）
let customDescriptions = {}; // カスタム説明の保存（localStorageから読み込み）

// スクリーンショット画像のマッピングを初期化
function initScreenshotMap() {
    // screenshotsフォルダ内の画像ファイル名からリポジトリ名を推測
    const screenshotFiles = [
        'cms-exercise-newmedia.png',
        'cms-presentation.png',
        'digitai-fabrication-web.png',
        'kwu-cms.github.io.png',
        'programming-b-web.png',
        'app-dev-glide.png'
    ];

    screenshotFiles.forEach(filename => {
        // ファイル名から.pngを除去してリポジトリ名を推測
        const repoName = filename.replace('.png', '');
        screenshotMap[repoName] = `screenshots/${filename}`;
    });
}

// カスタム説明をJSONファイルから読み込み
async function loadCustomDescriptions() {
    try {
        const response = await fetch('custom-descriptions.json');
        if (response.ok) {
            const data = await response.json();
            customDescriptions = data.descriptions || {};
            console.log('カスタム説明を読み込みました:', customDescriptions);
        } else {
            console.log('custom-descriptions.jsonが見つかりません。新規作成します。');
            customDescriptions = {};
        }
    } catch (e) {
        console.error('カスタム説明の読み込みに失敗しました:', e);
        customDescriptions = {};
    }
}

// カスタム説明をJSONファイルに保存（GitHub API経由でコミット）
async function saveCustomDescriptions() {
    try {
        const data = {
            description: "このファイルには、GitHubリポジトリのカスタム説明が保存されます。",
            descriptions: customDescriptions,
            lastUpdated: new Date().toISOString()
        };

        // まず、localStorageにもバックアップとして保存
        localStorage.setItem('customDescriptions', JSON.stringify(customDescriptions));

        // JSONファイルの内容を表示（ユーザーが手動でコミットできるように）
        console.log('カスタム説明を更新しました。以下の内容をcustom-descriptions.jsonに保存してください:');
        console.log(JSON.stringify(data, null, 2));

        // ファイルをダウンロードできるようにする
        downloadJSONFile(data, 'custom-descriptions.json');

        // GitHub APIで更新するオプション（認証が必要）
        const useGitHubAPI = confirm('GitHub APIを使ってリポジトリの説明を直接更新しますか？\n\n「キャンセル」を選択した場合、JSONファイルをダウンロードして手動でコミットしてください。');

        if (useGitHubAPI) {
            await updateDescriptionsViaGitHubAPI();
        }
    } catch (e) {
        console.error('カスタム説明の保存に失敗しました:', e);
        alert('保存に失敗しました。ブラウザのコンソールを確認してください。');
    }
}

// JSONファイルをダウンロード
function downloadJSONFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// GitHub APIでリポジトリの説明を更新
async function updateDescriptionsViaGitHubAPI() {
    const token = prompt('GitHub Personal Access Tokenを入力してください（repoスコープが必要です）:');

    if (!token) {
        alert('トークンが入力されませんでした。JSONファイルをダウンロードして手動でコミットしてください。');
        return;
    }

    // 各リポジトリの説明を更新
    const updatePromises = Object.entries(customDescriptions).map(async ([repoName, description]) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${ACCOUNT_NAME}/${repoName}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    description: description
                })
            });

            if (response.ok) {
                console.log(`[${repoName}] 説明を更新しました`);
                return { repoName, success: true };
            } else {
                const error = await response.json();
                console.error(`[${repoName}] 更新に失敗:`, error);
                return { repoName, success: false, error };
            }
        } catch (e) {
            console.error(`[${repoName}] エラー:`, e);
            return { repoName, success: false, error: e.message };
        }
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    alert(`${successCount}個のリポジトリの説明を更新しました。${failCount > 0 ? `\n${failCount}個の更新に失敗しました。コンソールを確認してください。` : ''}`);
}

// GitHub PagesのURLを生成
function getPagesUrl(repoName) {
    return `https://${ACCOUNT_NAME}.github.io/${repoName}`;
}

// GitHubリポジトリのURLを生成
function getRepoUrl(repoName) {
    return `https://github.com/${ACCOUNT_NAME}/${repoName}`;
}

// レート制限情報をlocalStorageから取得
function getRateLimitInfo() {
    try {
        const saved = localStorage.getItem('github_rate_limit');
        if (saved) {
            const data = JSON.parse(saved);
            const resetTime = new Date(parseInt(data.resetTime) * 1000);
            // リセット時刻が過ぎている場合は無効
            if (resetTime > new Date()) {
                return data;
            }
        }
    } catch (e) {
        console.error('レート制限情報の読み込みに失敗:', e);
    }
    return null;
}

// レート制限情報をlocalStorageに保存
function saveRateLimitInfo(resetTime) {
    try {
        localStorage.setItem('github_rate_limit', JSON.stringify({
            resetTime: resetTime,
            savedAt: Date.now()
        }));
    } catch (e) {
        console.error('レート制限情報の保存に失敗:', e);
    }
}

// レート制限情報をチェック
function checkRateLimit(response) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (response.status === 403 && (rateLimitRemaining === '0' || parseInt(rateLimitRemaining) === 0)) {
        // レート制限情報を保存
        if (rateLimitReset) {
            saveRateLimitInfo(rateLimitReset);
        }

        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
        const error = new Error(`GitHub APIのレート制限に達しました。\n\nリセット時刻: ${resetTime ? resetTime.toLocaleString('ja-JP') : '不明'}\n\nしばらく待ってから「再試行」ボタンをクリックしてください。`);
        error.isRateLimit = true;
        error.rateLimitReset = rateLimitReset;
        throw error;
    }

    return { rateLimitRemaining, rateLimitReset };
}

// レート制限中かどうかをチェック
function isRateLimited() {
    const rateLimitInfo = getRateLimitInfo();
    if (rateLimitInfo) {
        const resetTime = new Date(parseInt(rateLimitInfo.resetTime) * 1000);
        if (resetTime > new Date()) {
            return {
                limited: true,
                resetTime: resetTime
            };
        }
    }
    return { limited: false };
}

// アカウントタイプを自動検出
async function detectAccountType() {
    console.log(`アカウントタイプを自動検出中: ${ACCOUNT_NAME}`);

    // まず組織として試す
    try {
        const orgResponse = await fetch(`${GITHUB_API_BASE}/orgs/${ACCOUNT_NAME}`);

        // レート制限をチェック
        if (orgResponse.status === 403) {
            checkRateLimit(orgResponse);
        }

        if (orgResponse.ok) {
            console.log(`組織アカウントとして検出: ${ACCOUNT_NAME}`);
            return 'org';
        }
        console.log(`組織として見つかりませんでした (ステータス: ${orgResponse.status})`);
    } catch (error) {
        if (error.isRateLimit) {
            throw error; // レート制限エラーはそのまま再スロー
        }
        console.log(`組織の検出中にエラー: ${error.message}`);
    }

    // 組織でなければユーザーとして試す
    try {
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${ACCOUNT_NAME}`);

        // レート制限をチェック
        if (userResponse.status === 403) {
            checkRateLimit(userResponse);
        }

        if (userResponse.ok) {
            console.log(`ユーザーアカウントとして検出: ${ACCOUNT_NAME}`);
            return 'user';
        }
        console.log(`ユーザーとして見つかりませんでした (ステータス: ${userResponse.status})`);
    } catch (error) {
        if (error.isRateLimit) {
            throw error; // レート制限エラーはそのまま再スロー
        }
        console.log(`ユーザーの検出中にエラー: ${error.message}`);
    }

    // どちらでもない場合はエラー
    throw new Error(`アカウント "${ACCOUNT_NAME}" が見つかりませんでした。\n\nGitHubで https://github.com/${ACCOUNT_NAME} にアクセスして、アカウントが存在するか確認してください。`);
}

// リポジトリ情報をJSONファイルから読み込み
async function loadRepositoriesFromJSON() {
    try {
        // キャッシュを回避するためにタイムスタンプをクエリパラメータに追加
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`repositories.json${cacheBuster}`, {
            cache: 'no-cache'
        });
        if (response.ok) {
            const data = await response.json();
            console.log(`repositories.jsonから読み込みました (取得時刻: ${data.fetched_at || '不明'}, リポジトリ数: ${data.repositories?.length || 0}個)`);
            return data.repositories || [];
        }
    } catch (e) {
        console.log('repositories.jsonが見つかりません。GitHub APIから取得します。');
    }
    return null;
}

// リポジトリ情報を取得
async function fetchRepositories() {
    // JSONファイルから読み込みを試みる（init()で既に確認済みだが、念のため再確認）
    const reposFromJSON = await loadRepositoriesFromJSON();
    if (reposFromJSON && reposFromJSON.length > 0) {
        console.log(`JSONファイルから ${reposFromJSON.length}個のリポジトリを読み込みました`);
        // JSONファイルから読み込めた場合は、レート制限情報をクリア
        localStorage.removeItem('github_rate_limit');
        return reposFromJSON;
    }

    // JSONファイルがない場合、GitHub APIから取得
    console.log('GitHub APIからリポジトリ情報を取得します...');

    let accountType = ACCOUNT_TYPE;

    // 自動検出の場合
    if (accountType === 'auto') {
        try {
            accountType = await detectAccountType();
            console.log(`アカウントタイプを検出: ${accountType}`);
        } catch (error) {
            throw error;
        }
    }

    // APIエンドポイントを決定
    const endpoint = accountType === 'org'
        ? `${GITHUB_API_BASE}/orgs/${ACCOUNT_NAME}/repos`
        : `${GITHUB_API_BASE}/users/${ACCOUNT_NAME}/repos`;

    const apiUrl = `${endpoint}?per_page=100&sort=updated&type=all`;
    console.log(`GitHub APIを呼び出し中: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl);

        // レート制限情報を取得
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');

        console.log(`レスポンスステータス: ${response.status}`);
        console.log(`レート制限残り: ${rateLimitRemaining}`);

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;

            if (response.status === 404) {
                errorMessage = `アカウント "${ACCOUNT_NAME}" が見つかりませんでした。\n\n考えられる原因:\n1. アカウント名が間違っている可能性があります\n2. アカウントが存在しない可能性があります\n3. アカウントがプライベートで、アクセス権限がない可能性があります\n\n確認方法:\n- GitHubで https://github.com/${ACCOUNT_NAME} にアクセスしてアカウントが存在するか確認してください\n- アカウント名が異なる場合は、script.jsのACCOUNT_NAME定数を修正してください`;
            } else if (response.status === 403) {
                // レート制限の確認
                if (rateLimitRemaining === '0' || parseInt(rateLimitRemaining) === 0) {
                    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
                    if (resetTime) {
                        errorMessage = `GitHub APIのレート制限に達しました。\n\nリセット時刻: ${resetTime.toLocaleString('ja-JP')}\n\nしばらく待ってから「再試行」ボタンをクリックしてください。`;
                    } else {
                        errorMessage = `GitHub APIのレート制限に達しました。\n\nしばらく待ってから「再試行」ボタンをクリックしてください。`;
                    }
                } else {
                    errorMessage = `アクセスが拒否されました（403エラー）。\n\n考えられる原因:\n1. GitHub APIのレート制限（残り: ${rateLimitRemaining}回）\n2. アカウントへのアクセス権限がない\n3. ネットワークの問題\n\n「再試行」ボタンをクリックして再度お試しください。`;
                }
            } else if (response.status === 401) {
                errorMessage = `認証が必要です。`;
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.rateLimitRemaining = rateLimitRemaining;
            error.rateLimitReset = rateLimitReset;
            throw error;
        }

        const repos = await response.json();

        // レート制限情報をログに出力
        console.log(`GitHub API レート制限: 残り${rateLimitRemaining}回`);
        if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
            console.warn(`GitHub APIのレート制限が残り${rateLimitRemaining}回です。`);
        }

        console.log(`取得したリポジトリ数: ${repos.length}個`);

        return repos.filter(repo => !repo.archived); // アーカイブされたリポジトリを除外
    } catch (error) {
        console.error('Error fetching repositories:', error);

        // ネットワークエラーの場合
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        }

        throw error;
    }
}

// リポジトリカードを生成
function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.dataset.repoName = repo.name.toLowerCase();
    card.dataset.repoDescription = (repo.description || '').toLowerCase();

    // GitHub Pagesが有効かどうかを確認（descriptionにpagesのURLが含まれているか、または推測）
    // 実際には、各リポジトリのpages設定を確認する必要がありますが、
    // 簡易的にリポジトリ名から推測します
    const hasPages = repo.has_pages || repo.name.includes('page') || repo.name.includes('site');
    if (hasPages) {
        card.classList.add('has-pages');
    }

    // カスタム説明があればそれを使用、なければGitHubの説明を使用
    const description = customDescriptions[repo.name] || repo.description || '';
    const updated = new Date(repo.updated_at).toLocaleDateString('ja-JP');
    const pagesUrl = getPagesUrl(repo.name);

    // スクリーンショット画像のURL（複数のパスを試す）
    // ローカルのscreenshotsフォルダを最優先で試す
    const screenshotUrls = [];

    // ローカルのscreenshotsフォルダの画像を最優先
    if (screenshotMap[repo.name]) {
        screenshotUrls.push(screenshotMap[repo.name]);
    }

    // GitHub Pagesの画像
    screenshotUrls.push(
        `${pagesUrl}/og-image.png`,
        `${pagesUrl}/screenshot.png`,
        `${pagesUrl}/preview.png`,
        `${pagesUrl}/images/og-image.png`,
        `${pagesUrl}/images/screenshot.png`,
        `${pagesUrl}/images/preview.png`
    );

    // GitHubリポジトリの画像
    screenshotUrls.push(
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/screenshot.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/og-image.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/images/screenshot.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/images/og-image.png`
    );

    card.innerHTML = `
        <div class="repo-screenshot" data-repo-name="${repo.name}" style="background-color: var(--bg-color); background-size: cover; background-position: center; height: 200px; border-radius: 8px; margin-bottom: 1rem; position: relative; min-height: 200px;">
            <div class="screenshot-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%); border-radius: 8px;"></div>
        </div>
        <div class="repo-header">
            <h3 class="repo-title">
                <a href="${pagesUrl}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(repo.name)}
                </a>
            </h3>
        </div>
        <div class="repo-description-container">
            ${description ? `<p class="repo-description" data-repo-name="${repo.name}">${escapeHtml(description)}</p>` : `<p class="repo-description" data-repo-name="${repo.name}"></p>`}
            <button class="edit-description-btn" data-repo-name="${repo.name}" title="説明を編集">
                <svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                </svg>
            </button>
        </div>
        <div class="repo-meta">
            <span>更新: ${updated}</span>
        </div>
        <div class="repo-links">
            <a href="${pagesUrl}" class="repo-link" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542L3.343 7.914a3 3 0 101.414 1.414l1.372-1.372A4 4 0 002.5 7.5v-1A1.5 1.5 0 014 5h1V4a4 4 0 014-4h1a1.5 1.5 0 011.5 1.5v1H12a4 4 0 014 4v1a1.5 1.5 0 01-1.5 1.5h-1v1a4 4 0 01-4 4h-1a1.5 1.5 0 01-1.5-1.5v-1H4a4 4 0 01-4-4v-1a1.5 1.5 0 011.5-1.5h1V7.5z"/>
                </svg>
                Pages
            </a>
            <a href="${getRepoUrl(repo.name)}" class="repo-link secondary" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub
            </a>
        </div>
    `;

    // スクリーンショット画像の読み込み（複数のパスを試す）
    // 説明の有無に関わらず、常にスクリーンショットを試行
    const screenshotEl = card.querySelector('.repo-screenshot');
    if (screenshotEl) {
        let currentIndex = 0;
        let imageFound = false;

        const tryLoadImage = () => {
            if (currentIndex >= screenshotUrls.length) {
                // すべてのパスを試しても見つからない場合は非表示
                if (!imageFound) {
                    screenshotEl.style.display = 'none';
                    console.log(`[${repo.name}] スクリーンショット画像が見つかりませんでした`);
                }
                return;
            }

            const img = new Image();
            img.onload = () => {
                // 画像が見つかった
                imageFound = true;
                screenshotEl.style.backgroundImage = `url('${screenshotUrls[currentIndex]}')`;
                screenshotEl.style.backgroundSize = 'cover';
                screenshotEl.style.backgroundPosition = 'center';
                console.log(`[${repo.name}] スクリーンショット画像を読み込みました: ${screenshotUrls[currentIndex]}`);
            };
            img.onerror = () => {
                // 次のパスを試す
                currentIndex++;
                tryLoadImage();
            };
            img.src = screenshotUrls[currentIndex];
        };
        tryLoadImage();
    }

    // 説明編集ボタンのイベントリスナーを追加
    const editBtn = card.querySelector('.edit-description-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            showEditDescriptionModal(repo.name, description);
        });
    }

    return card;
}

// 説明編集モーダルを表示
function showEditDescriptionModal(repoName, currentDescription) {
    // モーダルのHTMLを作成
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <div class="edit-modal-header">
                <h2>説明を編集: ${escapeHtml(repoName)}</h2>
                <button class="edit-modal-close">&times;</button>
            </div>
            <div class="edit-modal-body">
                <textarea id="edit-description-textarea" rows="5" placeholder="リポジトリの説明を入力してください...">${escapeHtml(currentDescription)}</textarea>
            </div>
            <div class="edit-modal-footer">
                <button class="edit-modal-cancel">キャンセル</button>
                <button class="edit-modal-save">保存</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // モーダルを表示
    setTimeout(() => modal.classList.add('active'), 10);

    // イベントリスナー
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.edit-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.edit-modal-cancel').addEventListener('click', closeModal);
    modal.querySelector('.edit-modal-save').addEventListener('click', async () => {
        const newDescription = document.getElementById('edit-description-textarea').value.trim();
        await saveDescription(repoName, newDescription);
        closeModal();
    });

    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // テキストエリアにフォーカス
    document.getElementById('edit-description-textarea').focus();
}

// 説明を保存
async function saveDescription(repoName, description) {
    if (description) {
        customDescriptions[repoName] = description;
    } else {
        delete customDescriptions[repoName];
    }
    await saveCustomDescriptions();

    // 表示を更新
    const descriptionEl = document.querySelector(`.repo-description[data-repo-name="${repoName}"]`);
    if (descriptionEl) {
        if (description) {
            descriptionEl.textContent = description;
            descriptionEl.parentElement.style.display = '';
        } else {
            descriptionEl.textContent = '';
            // 元のGitHubの説明を表示
            const repo = allRepos.find(r => r.name === repoName);
            if (repo && repo.description) {
                descriptionEl.textContent = repo.description;
            }
        }
    }

    // 表示を更新（説明が変更されたため）
    displayRepos(allRepos);
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// リポジトリを表示
function displayRepos(repos) {
    const reposContainer = document.getElementById('repos-container');
    const emptyResults = document.getElementById('empty-results');

    // 既存のカードをクリア
    reposContainer.innerHTML = '';

    if (repos.length === 0) {
        emptyResults.style.display = 'block';
        reposContainer.style.display = 'none';
        return;
    }

    emptyResults.style.display = 'none';
    reposContainer.style.display = 'grid';

    // 更新日時順にソート
    const sortedRepos = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // カードを生成して追加
    sortedRepos.forEach(repo => {
        const card = createRepoCard(repo);
        reposContainer.appendChild(card);
    });
}

// ページを初期化
async function init() {
    // スクリーンショットマップとカスタム説明を初期化
    initScreenshotMap();
    await loadCustomDescriptions();

    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const reposContainer = document.getElementById('repos-container');

    // まずJSONファイルの存在を確認
    const reposFromJSON = await loadRepositoriesFromJSON();

    // JSONファイルがない場合のみレート制限をチェック
    if (!reposFromJSON || reposFromJSON.length === 0) {
        const rateLimitCheck = isRateLimited();
        if (rateLimitCheck.limited) {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            const errorMessage = errorEl.querySelector('p');
            if (errorMessage) {
                const resetTime = rateLimitCheck.resetTime;
                const message = `GitHub APIのレート制限中です。\n\nリセット時刻: ${resetTime.toLocaleString('ja-JP')}\n\nリセット時刻まで待ってから「再試行」ボタンをクリックしてください。\n\n💡 ヒント: repositories.jsonファイルを作成すると、レート制限を回避できます。\n\n[詳細情報]\nアカウント名: ${ACCOUNT_NAME}\nAPI URL: ${GITHUB_API_BASE}/users/${ACCOUNT_NAME}/repos または /orgs/${ACCOUNT_NAME}/repos`;
                errorMessage.innerHTML = message.replace(/\n/g, '<br>');
            }

            // リトライボタンを追加
            if (!errorEl.querySelector('.retry-button')) {
                const retryButton = document.createElement('button');
                retryButton.className = 'retry-button';
                retryButton.textContent = '再試行';
                retryButton.addEventListener('click', () => {
                    errorEl.style.display = 'none';
                    loadingEl.style.display = 'block';
                    init();
                });
                errorEl.appendChild(retryButton);
            }
            return;
        }
    }

    try {
        const repos = await fetchRepositories();

        loadingEl.style.display = 'none';

        if (repos.length === 0) {
            reposContainer.innerHTML = '<div class="empty-state"><p>リポジトリが見つかりませんでした。</p></div>';
            return;
        }

        // グローバル変数に保存
        allRepos = repos;

        // リポジトリを表示（更新日時順にソート）
        displayRepos(repos);

    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';

        // エラーメッセージを詳細に表示
        const errorMessage = errorEl.querySelector('p');
        if (errorMessage) {
            let message = error.message || 'リポジトリの取得に失敗しました。';

            // レート制限エラーの場合は特別な処理
            if (error.isRateLimit) {
                // レート制限情報を保存
                if (error.rateLimitReset) {
                    saveRateLimitInfo(error.rateLimitReset);
                }
            }

            // デバッグ情報を追加（常に表示）
            message += `\n\n[詳細情報]\n`;
            message += `アカウント名: ${ACCOUNT_NAME}\n`;
            message += `API URL: ${GITHUB_API_BASE}/users/${ACCOUNT_NAME}/repos または /orgs/${ACCOUNT_NAME}/repos\n`;
            if (error.status) {
                message += `HTTPステータス: ${error.status}\n`;
            }
            if (error.rateLimitRemaining !== undefined) {
                message += `レート制限残り: ${error.rateLimitRemaining}\n`;
            }
            if (error.rateLimitReset) {
                const resetTime = new Date(parseInt(error.rateLimitReset) * 1000);
                message += `レート制限リセット時刻: ${resetTime.toLocaleString('ja-JP')}\n`;
            }

            // レート制限の場合は追加の説明
            if (error.isRateLimit) {
                message += `\n💡 ヒント: レート制限を回避するには、GitHub Personal Access Tokenを使用してください。`;
            }

            // HTMLとして表示（改行を反映）
            errorMessage.innerHTML = message.replace(/\n/g, '<br>');
        }

        // リトライボタンを追加
        if (!errorEl.querySelector('.retry-button')) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.textContent = '再試行';
            retryButton.addEventListener('click', () => {
                errorEl.style.display = 'none';
                loadingEl.style.display = 'block';
                init();
            });
            errorEl.appendChild(retryButton);
        }

        console.error('Failed to load repositories:', error);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
