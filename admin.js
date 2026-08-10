const ACCOUNT_NAME = 'kwu-cms';
const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN_KEY = 'github_token';

let lastRows = [];
let lastMeta = null;

function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
    updateTokenStatus();
}

function updateTokenStatus() {
    const el = document.getElementById('token-status');
    const token = getToken();
    if (token) {
        el.textContent = 'トークンが保存されています（プライベートリポジトリも取得できます）';
        el.className = 'token-status ok';
        document.getElementById('token-input').value = token;
    } else {
        el.textContent = 'トークン未設定 — 公開リポジトリのみ確認できます';
        el.className = 'token-status warn';
    }
}

function authHeaders() {
    const headers = {
        Accept: 'application/vnd.github.v3+json'
    };
    const token = getToken();
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    return headers;
}

async function detectAccountType() {
    const headers = authHeaders();
    const orgRes = await fetch(`${GITHUB_API_BASE}/orgs/${ACCOUNT_NAME}`, { headers });
    if (orgRes.ok) return 'org';
    const userRes = await fetch(`${GITHUB_API_BASE}/users/${ACCOUNT_NAME}`, { headers });
    if (userRes.ok) return 'user';
    throw new Error(`アカウント "${ACCOUNT_NAME}" が見つかりませんでした`);
}

async function fetchLiveRepos() {
    const accountType = await detectAccountType();
    const endpoint = accountType === 'org'
        ? `${GITHUB_API_BASE}/orgs/${ACCOUNT_NAME}/repos`
        : `${GITHUB_API_BASE}/users/${ACCOUNT_NAME}/repos`;

    const headers = authHeaders();
    const repos = [];
    let page = 1;

    while (page <= 10) {
        const url = `${endpoint}?per_page=100&sort=updated&type=all&page=${page}`;
        const response = await fetch(url, { headers });

        if (response.status === 401) {
            throw new Error('トークンが無効です。保存し直してください。');
        }
        if (!response.ok) {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (response.status === 403 && remaining === '0') {
                const reset = response.headers.get('X-RateLimit-Reset');
                const resetTime = reset ? new Date(parseInt(reset, 10) * 1000).toLocaleString('ja-JP') : '不明';
                throw new Error(`GitHub API のレート制限に達しました。リセット: ${resetTime}`);
            }
            throw new Error(`GitHub API エラー: ${response.status}`);
        }

        const batch = await response.json();
        if (!Array.isArray(batch) || batch.length === 0) break;
        repos.push(...batch);
        if (batch.length < 100) break;
        page += 1;
    }

    return repos.filter(repo => !repo.archived);
}

async function loadSnapshot() {
    try {
        const response = await fetch(`repositories.json?t=${Date.now()}`, { cache: 'no-cache' });
        if (!response.ok) return { fetched_at: null, repositories: [] };
        return await response.json();
    } catch {
        return { fetched_at: null, repositories: [] };
    }
}

async function loadClassification() {
    const result = {
        hidden: [],
        courseMap: {},
        toolMap: {}
    };

    try {
        const response = await fetch(`custom-descriptions.json?t=${Date.now()}`, { cache: 'no-cache' });
        if (!response.ok) return result;
        const data = await response.json();
        result.hidden = data.hidden || [];

        Object.entries(data.courses || {}).forEach(([courseName, courseInfo]) => {
            Object.keys(courseInfo.repositories || {}).forEach(repoName => {
                result.courseMap[repoName] = courseName;
            });
        });

        Object.entries(data.tools || {}).forEach(([toolName, toolInfo]) => {
            Object.keys(toolInfo.repositories || {}).forEach(repoName => {
                result.toolMap[repoName] = toolName;
            });
        });
    } catch {
        // ignore
    }

    return result;
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return iso;
    }
}

function classifyRepo(name, classification) {
    if (classification.hidden.includes(name)) {
        return { kind: 'hidden', label: '非表示', courseOrTool: null };
    }
    if (classification.courseMap[name]) {
        return { kind: 'course', label: '授業', courseOrTool: classification.courseMap[name] };
    }
    if (classification.toolMap[name]) {
        return { kind: 'tool', label: 'Tools', courseOrTool: classification.toolMap[name] };
    }
    return { kind: 'unclassified', label: '未分類', courseOrTool: null };
}

function buildRows(liveRepos, snapshot, classification) {
    const snapshotMap = new Map(
        (snapshot.repositories || []).map(repo => [repo.name, repo])
    );
    const liveNames = new Set(liveRepos.map(repo => repo.name));
    const rows = [];

    liveRepos.forEach(repo => {
        const snap = snapshotMap.get(repo.name);
        const cls = classifyRepo(repo.name, classification);
        let diff = 'ok';
        let diffLabel = '一致';

        if (!snap) {
            diff = 'new';
            diffLabel = 'スナップショット未収録';
        } else if (snap.updated_at !== repo.updated_at) {
            diff = 'updated';
            diffLabel = '更新あり';
        } else if (Boolean(snap.private) !== Boolean(repo.private)) {
            diff = 'updated';
            diffLabel = '可視性変更';
        }

        const needsAttention =
            cls.kind === 'unclassified' ||
            diff === 'new' ||
            diff === 'updated' ||
            (repo.private && cls.kind !== 'hidden');

        rows.push({
            name: repo.name,
            private: Boolean(repo.private),
            hasPages: Boolean(repo.has_pages),
            updatedAt: repo.updated_at,
            htmlUrl: repo.html_url,
            pagesUrl: repo.has_pages
                ? `https://${ACCOUNT_NAME}.github.io/${repo.name}/`
                : null,
            classification: cls,
            diff,
            diffLabel,
            inSnapshot: Boolean(snap),
            needsAttention,
            source: 'live'
        });
    });

    // スナップショットにあるが API に無いもの（削除・非公開化・権限不足）
    (snapshot.repositories || []).forEach(snap => {
        if (liveNames.has(snap.name)) return;
        const cls = classifyRepo(snap.name, classification);
        rows.push({
            name: snap.name,
            private: Boolean(snap.private),
            hasPages: Boolean(snap.has_pages),
            updatedAt: snap.updated_at,
            htmlUrl: snap.html_url || `https://github.com/${ACCOUNT_NAME}/${snap.name}`,
            pagesUrl: null,
            classification: cls,
            diff: 'snapshot-only',
            diffLabel: 'APIに無し',
            inSnapshot: true,
            needsAttention: true,
            source: 'snapshot'
        });
    });

    rows.sort((a, b) => {
        if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return rows;
}

function summarize(rows, snapshot) {
    return {
        total: rows.filter(r => r.source === 'live').length,
        private: rows.filter(r => r.source === 'live' && r.private).length,
        public: rows.filter(r => r.source === 'live' && !r.private).length,
        unclassified: rows.filter(r => r.classification.kind === 'unclassified' && r.source === 'live').length,
        hidden: rows.filter(r => r.classification.kind === 'hidden').length,
        newOrMissing: rows.filter(r => r.diff === 'new' || r.diff === 'snapshot-only').length,
        updated: rows.filter(r => r.diff === 'updated').length,
        fetchedAt: snapshot.fetched_at || null
    };
}

function renderSummary(summary) {
    const cards = [
        { label: '合計', value: summary.total },
        { label: '公開', value: summary.public },
        { label: 'Private', value: summary.private, attention: summary.private > 0 },
        { label: '未分類', value: summary.unclassified, attention: summary.unclassified > 0 },
        { label: '新規/欠落', value: summary.newOrMissing, attention: summary.newOrMissing > 0 },
        { label: '更新あり', value: summary.updated, attention: summary.updated > 0 }
    ];

    document.getElementById('summary-cards').innerHTML = cards.map(card => `
        <div class="summary-card${card.attention ? ' attention' : ''}">
            <span class="value">${card.value}</span>
            <span class="label">${card.label}</span>
        </div>
    `).join('');

    const meta = document.getElementById('snapshot-meta');
    meta.textContent = summary.fetchedAt
        ? `repositories.json 取得時刻: ${formatDate(summary.fetchedAt)}`
        : 'repositories.json が見つかりません';
}

function badgeClassForClassification(kind) {
    return {
        course: 'badge-course',
        tool: 'badge-tool',
        hidden: 'badge-hidden',
        unclassified: 'badge-unclassified'
    }[kind] || 'badge-hidden';
}

function badgeClassForDiff(diff) {
    return {
        ok: 'badge-ok',
        new: 'badge-new',
        updated: 'badge-updated',
        'snapshot-only': 'badge-snapshot-only'
    }[diff] || 'badge-ok';
}

function renderTable(rows, attentionOnly) {
    const tbody = document.getElementById('repo-tbody');
    const visible = attentionOnly ? rows.filter(r => r.needsAttention) : rows;

    if (visible.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="admin-placeholder">${
            attentionOnly ? '要対応のリポジトリはありません' : 'リポジトリがありません'
        }</td></tr>`;
        return;
    }

    tbody.innerHTML = visible.map(row => {
        const clsTitle = row.classification.courseOrTool
            ? ` title="${escapeHtml(row.classification.courseOrTool)}"`
            : '';
        const rowClass = [
            row.needsAttention ? 'needs-attention' : '',
            row.private ? 'row-private' : ''
        ].filter(Boolean).join(' ');

        return `
            <tr class="${rowClass}">
                <td class="repo-name">${escapeHtml(row.name)}</td>
                <td>
                    <span class="badge ${row.private ? 'badge-private' : 'badge-public'}">
                        ${row.private ? 'private' : 'public'}
                    </span>
                </td>
                <td>
                    <span class="badge ${badgeClassForClassification(row.classification.kind)}"${clsTitle}>
                        ${escapeHtml(row.classification.label)}
                    </span>
                </td>
                <td>
                    <span class="${row.hasPages ? 'badge-yes' : 'badge-no'}">
                        ${row.hasPages ? 'あり' : 'なし'}
                    </span>
                </td>
                <td>${formatDate(row.updatedAt)}</td>
                <td>
                    <span class="badge ${badgeClassForDiff(row.diff)}">
                        ${escapeHtml(row.diffLabel)}
                    </span>
                </td>
                <td>
                    <a href="${escapeAttr(row.htmlUrl)}" target="_blank" rel="noopener">GitHub</a>
                    ${row.pagesUrl ? ` · <a href="${escapeAttr(row.pagesUrl)}" target="_blank" rel="noopener">Pages</a>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function renderAttentionNotes(rows) {
    const notes = [];
    const unclassified = rows.filter(r => r.classification.kind === 'unclassified' && r.source === 'live');
    const privates = rows.filter(r => r.private && r.source === 'live' && r.classification.kind !== 'hidden');
    const news = rows.filter(r => r.diff === 'new');
    const updated = rows.filter(r => r.diff === 'updated');
    const missing = rows.filter(r => r.diff === 'snapshot-only');

    if (unclassified.length) {
        notes.push(`未分類（公開ページに出ません）: ${unclassified.map(r => r.name).join(', ')} → <code>custom-descriptions.json</code> に追加`);
    }
    if (privates.length) {
        notes.push(`Private: ${privates.map(r => r.name).join(', ')} → 公開するなら GitHub で public にしてから fetch を実行（private は repositories.json に書き込みません）`);
    }
    if (news.length) {
        notes.push(`スナップショット未収録: ${news.map(r => r.name).join(', ')} → <code>python scripts/fetch_repositories.py</code>`);
    }
    if (updated.length) {
        notes.push(`更新あり: ${updated.map(r => r.name).join(', ')} → fetch で repositories.json を更新`);
    }
    if (missing.length) {
        notes.push(`APIに無い（削除・権限不足の可能性）: ${missing.map(r => r.name).join(', ')}`);
    }

    const el = document.getElementById('attention-notes');
    if (!notes.length) {
        el.innerHTML = '<p class="admin-placeholder">対応が必要な項目はありません。</p>';
        return;
    }
    el.innerHTML = `<ul class="attention-list">${notes.map(n => `<li>${n}</li>`).join('')}</ul>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}

function refreshView() {
    if (!lastRows.length && !lastMeta) return;
    const attentionOnly = document.getElementById('filter-attention').checked;
    renderSummary(lastMeta);
    renderTable(lastRows, attentionOnly);
    renderAttentionNotes(lastRows);
}

async function checkUpdates() {
    const btn = document.getElementById('check-updates');
    const status = document.getElementById('check-status');
    btn.disabled = true;
    status.textContent = 'GitHub API から取得中...';

    try {
        const [liveRepos, snapshot, classification] = await Promise.all([
            fetchLiveRepos(),
            loadSnapshot(),
            loadClassification()
        ]);

        lastRows = buildRows(liveRepos, snapshot, classification);
        lastMeta = summarize(lastRows, snapshot);
        refreshView();

        const tokenNote = getToken() ? '（トークンあり）' : '（トークンなし・公開のみ）';
        status.textContent = `確認完了: ライブ ${liveRepos.length} 件 ${tokenNote}`;
    } catch (error) {
        console.error(error);
        status.textContent = `エラー: ${error.message}`;
    } finally {
        btn.disabled = false;
    }
}

function init() {
    updateTokenStatus();

    document.getElementById('save-token').addEventListener('click', () => {
        const value = document.getElementById('token-input').value.trim();
        setToken(value);
    });

    document.getElementById('clear-token').addEventListener('click', () => {
        document.getElementById('token-input').value = '';
        setToken('');
    });

    document.getElementById('check-updates').addEventListener('click', checkUpdates);
    document.getElementById('filter-attention').addEventListener('change', refreshView);

    // 初回は自動確認
    checkUpdates();
}

init();
