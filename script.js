// GitHub API設定
const ORGANIZATION = 'kwu-cms';
const GITHUB_API_BASE = 'https://api.github.com';

// グローバル変数
let allRepos = [];
let filteredRepos = [];

// GitHub PagesのURLを生成
function getPagesUrl(repoName) {
    return `https://${ORGANIZATION}.github.io/${repoName}`;
}

// GitHubリポジトリのURLを生成
function getRepoUrl(repoName) {
    return `https://github.com/${ORGANIZATION}/${repoName}`;
}

// リポジトリ情報を取得
async function fetchRepositories() {
    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/orgs/${ORGANIZATION}/repos?per_page=100&sort=updated&type=all`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const repos = await response.json();
        return repos.filter(repo => !repo.archived); // アーカイブされたリポジトリを除外
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

// リポジトリカードを生成
function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.dataset.repoName = repo.name.toLowerCase();
    card.dataset.repoLanguage = (repo.language || 'その他').toLowerCase();
    card.dataset.repoDescription = (repo.description || '').toLowerCase();
    
    // GitHub Pagesが有効かどうかを確認（descriptionにpagesのURLが含まれているか、または推測）
    // 実際には、各リポジトリのpages設定を確認する必要がありますが、
    // 簡易的にリポジトリ名から推測します
    const hasPages = repo.has_pages || repo.name.includes('page') || repo.name.includes('site');
    if (hasPages) {
        card.classList.add('has-pages');
    }

    const description = repo.description || '説明なし';
    const language = repo.language || 'その他';
    const stars = repo.stargazers_count || 0;
    const updated = new Date(repo.updated_at).toLocaleDateString('ja-JP');

    card.innerHTML = `
        <div class="repo-header">
            <h3 class="repo-title">
                <a href="${getRepoUrl(repo.name)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(repo.name)}
                </a>
            </h3>
            <span class="repo-language">${escapeHtml(language)}</span>
        </div>
        <p class="repo-description">${escapeHtml(description)}</p>
        <div class="repo-meta">
            <span>
                <svg fill="currentColor" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                </svg>
                ${stars}
            </span>
            <span>更新: ${updated}</span>
        </div>
        <div class="repo-links">
            <a href="${getRepoUrl(repo.name)}" class="repo-link secondary" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub
            </a>
            <a href="${getPagesUrl(repo.name)}" class="repo-link" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542L3.343 7.914a3 3 0 101.414 1.414l1.372-1.372A4 4 0 002.5 7.5v-1A1.5 1.5 0 014 5h1V4a4 4 0 014-4h1a1.5 1.5 0 011.5 1.5v1H12a4 4 0 014 4v1a1.5 1.5 0 01-1.5 1.5h-1v1a4 4 0 01-4 4h-1a1.5 1.5 0 01-1.5-1.5v-1H4a4 4 0 01-4-4v-1a1.5 1.5 0 011.5-1.5h1V7.5z"/>
                </svg>
                Pages
            </a>
        </div>
    `;

    // Pagesリンクのクリックイベントで404チェック（オプション）
    const pagesLink = card.querySelector('.repo-link:not(.secondary)');
    pagesLink.addEventListener('click', async (e) => {
        // リンクは通常通り開くが、必要に応じて事前チェックも可能
        // ここでは通常のリンク動作を許可
    });

    return card;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 言語リストを取得
function getLanguages(repos) {
    const languages = new Set();
    repos.forEach(repo => {
        const lang = repo.language || 'その他';
        languages.add(lang);
    });
    return Array.from(languages).sort();
}

// 言語フィルタのオプションを生成
function populateLanguageFilter(repos) {
    const languageFilter = document.getElementById('language-filter');
    const languages = getLanguages(repos);
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });
}

// リポジトリをソート
function sortRepos(repos, sortBy) {
    const sorted = [...repos];
    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            break;
        case 'stars':
            sorted.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
            break;
        case 'updated':
        default:
            sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
    }
    return sorted;
}

// リポジトリをフィルタリング
function filterRepos(repos, searchTerm, languageFilter) {
    return repos.filter(repo => {
        const matchesSearch = !searchTerm || 
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesLanguage = !languageFilter || 
            (repo.language || 'その他') === languageFilter;
        
        return matchesSearch && matchesLanguage;
    });
}

// リポジトリを表示
function displayRepos(repos) {
    const reposContainer = document.getElementById('repos-container');
    const emptyResults = document.getElementById('empty-results');
    const repoCount = document.getElementById('repo-count');
    
    // 既存のカードをクリア
    reposContainer.innerHTML = '';
    
    // 統計情報を更新
    repoCount.textContent = repos.length;
    
    if (repos.length === 0) {
        emptyResults.style.display = 'block';
        reposContainer.style.display = 'none';
        return;
    }
    
    emptyResults.style.display = 'none';
    reposContainer.style.display = 'grid';
    
    // カードを生成して追加
    repos.forEach(repo => {
        const card = createRepoCard(repo);
        reposContainer.appendChild(card);
    });
}

// 検索とフィルタを適用
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const languageFilter = document.getElementById('language-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    
    // フィルタリング
    filteredRepos = filterRepos(allRepos, searchTerm, languageFilter);
    
    // ソート
    filteredRepos = sortRepos(filteredRepos, sortBy);
    
    // 表示
    displayRepos(filteredRepos);
}

// ページを初期化
async function init() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const controlsEl = document.getElementById('controls');
    const reposContainer = document.getElementById('repos-container');

    try {
        const repos = await fetchRepositories();
        
        loadingEl.style.display = 'none';

        if (repos.length === 0) {
            reposContainer.innerHTML = '<div class="empty-state"><p>リポジトリが見つかりませんでした。</p></div>';
            return;
        }

        // グローバル変数に保存
        allRepos = repos;
        filteredRepos = repos;

        // コントロールを表示
        controlsEl.style.display = 'flex';
        
        // 言語フィルタを設定
        populateLanguageFilter(repos);

        // 初期表示（更新日時でソート）
        filteredRepos = sortRepos(filteredRepos, 'updated');
        displayRepos(filteredRepos);

        // イベントリスナーを設定
        document.getElementById('search-input').addEventListener('input', applyFilters);
        document.getElementById('language-filter').addEventListener('change', applyFilters);
        document.getElementById('sort-filter').addEventListener('change', applyFilters);

    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        console.error('Failed to load repositories:', error);
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
