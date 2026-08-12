// GitHub API設定
const ACCOUNT_NAME = 'kwu-cms'; // ユーザーアカウントまたは組織名
const GITHUB_API_BASE = 'https://api.github.com';
const ACCOUNT_TYPE = 'auto'; // 'user', 'org', または 'auto'（自動検出）

// グローバル変数
let allRepos = [];
let screenshotMap = {}; // スクリーンショット画像のマッピング（リポジトリ名 -> 画像パス）
let customDescriptions = {}; // カスタム説明の保存（localStorageから読み込み）
let courseInfoMap = {}; // リポジトリ名 -> 授業情報のマッピング
let courseData = {}; // 授業データ全体
let eventInfoMap = {}; // リポジトリ名 -> 特設・イベント情報
let eventsData = {};
let toolInfoMap = {}; // リポジトリ名 -> ツール情報のマッピング
let toolsData = {}; // ツールデータ全体
let hiddenRepos = []; // 一覧に表示しないリポジトリ

function filterVisibleRepos(repos) {
    if (!hiddenRepos.length) return repos;
    return repos.filter(repo => !hiddenRepos.includes(repo.name));
}

function isBlankTagToken(value) {
    if (value === null || value === undefined) return true;
    const normalized = String(value).trim().toLowerCase();
    return normalized === '' || normalized === 'none' || normalized === 'null';
}

/** tags 配列、または旧 year/type から表示用ラベル配列を作る */
function normalizeItemTags(itemInfo = {}) {
    const tags = [];
    const seen = new Set();

    const pushTag = (raw) => {
        if (isBlankTagToken(raw)) return;
        const label = String(raw).trim();
        if (!label || seen.has(label)) return;
        seen.add(label);
        tags.push(label);
    };

    if (Array.isArray(itemInfo.tags)) {
        itemInfo.tags.forEach(pushTag);
    }

    // 後方互換: year / type（"none" は無視）
    if (!Array.isArray(itemInfo.tags) || itemInfo.tags.length === 0) {
        if (!isBlankTagToken(itemInfo.year)) {
            pushTag(`${itemInfo.year}年次`);
        }
        if (!isBlankTagToken(itemInfo.type)) {
            pushTag(itemInfo.type);
        }
    }

    return tags;
}

function registerGroupItems(groupData, map, kind) {
    Object.entries(groupData || {}).forEach(([groupName, groupInfo]) => {
        if (!groupInfo || !groupInfo.repositories) return;
        const tags = normalizeItemTags(groupInfo);
        Object.entries(groupInfo.repositories).forEach(([repoName, description]) => {
            customDescriptions[repoName] = description;
            map[repoName] = {
                kind,
                groupName,
                summary: groupInfo.summary || null,
                tags,
                description
            };
        });
    });
}

// スクリーンショット画像のマッピングを読み込み
async function loadScreenshotMap() {
    try {
        const response = await fetch('screenshots/manifest.json');
        if (response.ok) {
            const data = await response.json();
            screenshotMap = data.screenshots || {};
            return;
        }
    } catch (error) {
        console.warn('screenshots/manifest.json の読み込みに失敗しました:', error);
    }
    screenshotMap = {};
}

// カスタム説明をJSONファイルから読み込み
async function loadCustomDescriptions() {
    customDescriptions = {};
    courseInfoMap = {};
    eventInfoMap = {};
    toolInfoMap = {};
    courseData = {};
    eventsData = {};
    toolsData = {};
    hiddenRepos = [];

    try {
        const response = await fetch('custom-descriptions.json');
        if (response.ok) {
            const data = await response.json();
            hiddenRepos = data.hidden || [];
            courseData = data.courses || {};
            eventsData = data.events || {};
            toolsData = data.tools || {};

            registerGroupItems(courseData, courseInfoMap, 'course');
            registerGroupItems(eventsData, eventInfoMap, 'event');

            if (data.tools) {
                registerGroupItems(data.tools, toolInfoMap, 'tool');
            } else if (data.other) {
                // 旧構造: フラットな other を Tools セクションとして読み込み
                toolsData = { Tools: { repositories: data.other, tags: ['ツール'] } };
                registerGroupItems(toolsData, toolInfoMap, 'tool');
            } else if (data.descriptions) {
                customDescriptions = data.descriptions;
            }

            console.log('カスタム説明を読み込みました:', customDescriptions);
            console.log('授業情報マップ:', courseInfoMap);
            console.log('イベント情報マップ:', eventInfoMap);
            console.log('ツール情報マップ:', toolInfoMap);
        } else {
            console.log('custom-descriptions.jsonが見つかりません。');
        }
    } catch (e) {
        console.error('カスタム説明の読み込みに失敗しました:', e);
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
function getPagesUrl(repo) {
    // リポジトリ情報にpages_urlがあればそれを使用
    if (repo.pages_url) {
        return repo.pages_url;
    }
    // フォールバック: 標準的なURLを生成
    return `https://${ACCOUNT_NAME}.github.io/${repo.name}`;
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
            return filterVisibleRepos(data.repositories || []);
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

        return filterVisibleRepos(repos.filter(repo => !repo.archived)); // アーカイブ・非公開を除外
    } catch (error) {
        console.error('Error fetching repositories:', error);

        // ネットワークエラーの場合
        if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
            throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        }

        throw error;
    }
}

function getItemInfo(repoName) {
    return courseInfoMap[repoName] || eventInfoMap[repoName] || toolInfoMap[repoName] || null;
}

// リポジトリカードを生成
function createRepoCard(repo) {
    const card = document.createElement('article');
    card.className = 'repo-card';
    card.dataset.repoName = repo.name.toLowerCase();
    card.dataset.repoDescription = (repo.description || '').toLowerCase();

    const pagesUrl = getPagesUrl(repo);
    if (pagesUrl) {
        card.classList.add('is-clickable');
        card.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            window.open(pagesUrl, '_blank', 'noopener,noreferrer');
        });
    }

    if (repo.has_pages && repo.pages_url) {
        card.classList.add('has-pages');
    }

    const description = customDescriptions[repo.name] || repo.description || '';
    const updated = new Date(repo.updated_at).toLocaleDateString('ja-JP');

    const itemInfo = getItemInfo(repo.name);
    const displayName = itemInfo ? itemInfo.groupName : repo.name;
    const displaySummary = itemInfo ? itemInfo.summary : null;
    const tags = itemInfo ? (itemInfo.tags || []) : [];
    const kind = itemInfo ? itemInfo.kind : null;

    const tagClassByKind = {
        course: 'course-tag-course',
        event: 'course-tag-event',
        tool: 'course-tag-tool'
    };
    const tagClass = tagClassByKind[kind] || 'course-tag-course';
    const tagsHtml = tags
        .map(tag => `<span class="course-tag ${tagClass}">${escapeHtml(tag)}</span>`)
        .join('');

    const linkLabel = kind === 'tool' ? '開く' : (kind === 'event' ? 'サイトを見る' : '成果を見る');

    const screenshotUrls = [];
    if (screenshotMap[repo.name]) {
        screenshotUrls.push(screenshotMap[repo.name]);
    }
    if (pagesUrl) {
        screenshotUrls.push(
            `${pagesUrl}/og-image.png`,
            `${pagesUrl}/screenshot.png`,
            `${pagesUrl}/preview.png`,
            `${pagesUrl}/images/og-image.png`,
            `${pagesUrl}/images/screenshot.png`,
            `${pagesUrl}/images/preview.png`
        );
    }
    screenshotUrls.push(
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/screenshot.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/og-image.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/images/screenshot.png`,
        `https://raw.githubusercontent.com/${ACCOUNT_NAME}/${repo.name}/main/images/og-image.png`
    );

    const titleInner = pagesUrl
        ? `<a href="${pagesUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayName)}</a>`
        : `<span>${escapeHtml(displayName)}</span>`;

    card.innerHTML = `
        <div class="repo-media is-placeholder" data-repo-name="${escapeHtml(repo.name)}" aria-hidden="true">
            <div class="repo-media-image"></div>
        </div>
        <div class="repo-body">
            ${tagsHtml ? `<div class="repo-tags">${tagsHtml}</div>` : ''}
            <h3 class="repo-title">${titleInner}</h3>
            ${displaySummary ? `<p class="repo-summary">${escapeHtml(displaySummary)}</p>` : ''}
            ${description ? `<p class="repo-description" data-repo-name="${escapeHtml(repo.name)}">${escapeHtml(description)}</p>` : ''}
            <div class="repo-meta">
                <span class="repo-updated">更新 ${updated}</span>
                ${pagesUrl ? `<a href="${pagesUrl}" class="course-link" target="_blank" rel="noopener noreferrer">
                    <span>${linkLabel}</span>
                    <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>` : ''}
            </div>
        </div>
    `;

    const mediaEl = card.querySelector('.repo-media');
    const mediaImageEl = card.querySelector('.repo-media-image');
    if (mediaEl && mediaImageEl) {
        let currentIndex = 0;

        const tryLoadImage = () => {
            if (currentIndex >= screenshotUrls.length) {
                mediaEl.classList.add('is-placeholder');
                mediaEl.classList.remove('has-image');
                return;
            }

            const img = new Image();
            img.onload = () => {
                mediaImageEl.style.backgroundImage = `url('${screenshotUrls[currentIndex]}')`;
                mediaEl.classList.add('has-image');
                mediaEl.classList.remove('is-placeholder');
            };
            img.onerror = () => {
                currentIndex++;
                tryLoadImage();
            };
            img.src = screenshotUrls[currentIndex];
        };
        tryLoadImage();
    }

    return card;
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

    reposContainer.innerHTML = '';

    const classifiedRepos = repos.filter(
        repo => courseInfoMap[repo.name] || eventInfoMap[repo.name] || toolInfoMap[repo.name]
    );
    const courseRepos = classifiedRepos
        .filter(repo => courseInfoMap[repo.name])
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const eventRepos = classifiedRepos
        .filter(repo => eventInfoMap[repo.name])
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const toolRepos = classifiedRepos
        .filter(repo => toolInfoMap[repo.name])
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (classifiedRepos.length === 0) {
        emptyResults.style.display = 'block';
        reposContainer.style.display = 'none';
        return;
    }

    emptyResults.style.display = 'none';
    reposContainer.style.display = 'flex';

    if (courseRepos.length > 0) {
        reposContainer.appendChild(createRepoSection('授業成果', courseRepos));
    }
    if (eventRepos.length > 0) {
        reposContainer.appendChild(createRepoSection('特設・イベント', eventRepos));
    }
    if (toolRepos.length > 0) {
        reposContainer.appendChild(createRepoSection('Tools', toolRepos));
    }

    requestAnimationFrame(() => {
        reposContainer.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('is-visible');
        });
    });
}

function createRepoSection(title, repos) {
    const section = document.createElement('section');
    section.className = 'repo-section reveal';

    const heading = document.createElement('h2');
    heading.className = 'repo-section-title';
    heading.textContent = title;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'repos-grid';
    repos.forEach((repo, index) => {
        const card = createRepoCard(repo);
        card.style.setProperty('--reveal-delay', `${Math.min(index * 60, 360)}ms`);
        card.classList.add('reveal');
        grid.appendChild(card);
    });
    section.appendChild(grid);

    return section;
}

// ページを初期化
async function init() {
    // スクリーンショットマップとカスタム説明を初期化
    await loadScreenshotMap();
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
