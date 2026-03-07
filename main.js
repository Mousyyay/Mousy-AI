const VALID_MODELS = [
    'gpt-5.4', 'gpt-5-mini',
    'gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano'
];

const state = {
    chats: JSON.parse(localStorage.getItem('mousy_chats') || '[]'),
    currentId: null,
    settings: JSON.parse(localStorage.getItem('mousy_settings') || 'null') || {
        systemPrompt: "You are Mousy's AI, a helpful and precise assistant. Format code in markdown code blocks with the language name."
    },
    apiKey: localStorage.getItem('mousy_apikey') || '',
    sending: false
};

const el = {
    sidebar:             document.getElementById('sidebar'),
    overlay:             document.getElementById('sidebarOverlay'),
    historyList:         document.getElementById('historyList'),
    chatContainer:       document.getElementById('chatContainer'),
    chatInput:           document.getElementById('chatInput'),
    sendBtn:             document.getElementById('sendBtn'),
    modelSelect:         document.getElementById('modelSelect'),
    newChatBtn:          document.getElementById('newChatBtn'),
    openSettingsBtn:     document.getElementById('openSettingsBtn'),
    backToChat:          document.getElementById('backToChat'),
    chatView:            document.getElementById('chatView'),
    settingsView:        document.getElementById('settingsView'),
    systemPromptInput:   document.getElementById('systemPromptInput'),
    saveSystemPromptBtn: document.getElementById('saveSystemPromptBtn'),
    apiKeyInput:         document.getElementById('apiKeyInput'),
    saveApiKeyBtn:       document.getElementById('saveApiKeyBtn'),
    toggleKeyBtn:        document.getElementById('toggleKeyBtn'),
    keyBadge:            document.getElementById('keyBadge'),
    wipeMemoryBtn:       document.getElementById('wipeMemoryBtn'),
    toastContainer:      document.getElementById('toastContainer')
};

function init() {
    lucide.createIcons();
    el.systemPromptInput.value = state.settings.systemPrompt;
    el.apiKeyInput.value = state.apiKey;
    updateKeyBadge();

    if (state.chats.length > 0) {
        switchChat(state.chats[0].id);
    } else {
        createNewChat();
    }

    bindEvents();
    renderHistory();
}

function bindEvents() {
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    el.overlay.addEventListener('click', toggleSidebar);
    el.newChatBtn.addEventListener('click', createNewChat);
    el.sendBtn.addEventListener('click', sendMessage);

    el.chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    el.chatInput.addEventListener('input', () => {
        el.chatInput.style.height = 'auto';
        el.chatInput.style.height = Math.min(el.chatInput.scrollHeight, 160) + 'px';
    });

    el.openSettingsBtn.addEventListener('click', () => switchView('settings'));
    el.backToChat.addEventListener('click', () => switchView('chat'));
    el.saveApiKeyBtn.addEventListener('click', saveApiKey);
    el.saveSystemPromptBtn.addEventListener('click', saveSystemPrompt);

    el.toggleKeyBtn.addEventListener('click', () => {
        const show = el.apiKeyInput.type === 'password';
        el.apiKeyInput.type = show ? 'text' : 'password';
        el.toggleKeyBtn.innerHTML = show
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';
        lucide.createIcons();
    });

    el.wipeMemoryBtn.addEventListener('click', () => {
        if (confirm('Delete all chats, settings and API key?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

function toggleSidebar() {
    el.sidebar.classList.toggle('open');
    el.overlay.classList.toggle('active');
}

function switchView(view) {
    const from = view === 'settings' ? el.chatView : el.settingsView;
    const to   = view === 'settings' ? el.settingsView : el.chatView;

    from.classList.add('view-leave');
    setTimeout(() => {
        from.classList.remove('active', 'view-leave');
        to.classList.add('active', 'view-enter');
        lucide.createIcons();
        setTimeout(() => to.classList.remove('view-enter'), 340);
    }, 200);

    if (window.innerWidth <= 768) {
        el.sidebar.classList.remove('open');
        el.overlay.classList.remove('active');
    }
}

function saveApiKey() {
    const raw = el.apiKeyInput.value.trim();
    if (!raw)                  { showToast('Enter a key first.', 'error'); return; }
    if (!raw.startsWith('sk-')){ showToast('Key must start with  sk-', 'error'); return; }
    if (raw.length < 40)       { showToast('Key looks too short — check it.', 'error'); return; }
    if (/\s/.test(raw))        { showToast('Key has spaces — remove them.', 'error'); return; }

    state.apiKey = raw;
    localStorage.setItem('mousy_apikey', raw);
    updateKeyBadge();
    showToast('API key saved.', 'success');
}

function saveSystemPrompt() {
    const val = el.systemPromptInput.value.trim();
    if (!val) { showToast('Prompt cannot be empty.', 'error'); return; }
    state.settings.systemPrompt = val;
    saveSettings();
    showToast('System prompt saved.', 'success');
}

function updateKeyBadge() {
    const ok = state.apiKey && state.apiKey.startsWith('sk-') && state.apiKey.length >= 40;
    el.keyBadge.textContent = ok ? '● Active' : '● No Key';
    el.keyBadge.className = 'key-badge ' + (ok ? 'has-key' : 'no-key');
}

function createNewChat() {
    const id = Date.now().toString();
    const model = VALID_MODELS.includes(el.modelSelect.value) ? el.modelSelect.value : 'gpt-4o';
    state.chats.unshift({ id, title: 'New Chat', messages: [], model });
    state.currentId = id;
    saveChats();
    renderHistory();
    renderMessages();
    el.modelSelect.disabled = false;
    closeSidebarMobile();
}

function switchChat(id) {
    state.currentId = id;
    const chat = state.chats.find(c => c.id === id);
    if (!chat) return;
    el.modelSelect.value = VALID_MODELS.includes(chat.model) ? chat.model : 'gpt-4o';
    el.modelSelect.disabled = chat.messages.length > 0;
    renderHistory();
    renderMessages();
    closeSidebarMobile();
}

function closeSidebarMobile() {
    if (window.innerWidth <= 768) {
        el.sidebar.classList.remove('open');
        el.overlay.classList.remove('active');
    }
}

function renderHistory() {
    el.historyList.innerHTML = '';
    state.chats.forEach((chat, i) => {
        const btn = document.createElement('button');
        btn.className = 'history-item' + (chat.id === state.currentId ? ' active' : '');
        btn.innerHTML = `<i data-lucide="message-circle"></i><span>${esc(chat.title)}</span>`;
        btn.style.animationDelay = `${i * 0.025}s`;
        btn.addEventListener('click', () => switchChat(chat.id));
        el.historyList.appendChild(btn);
    });
    lucide.createIcons();
}

function renderMessages() {
    el.chatContainer.innerHTML = '';
    const chat = state.chats.find(c => c.id === state.currentId);

    if (!chat || chat.messages.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
            <div class="empty-orb">
                <div class="orb-ring"></div>
                <div class="orb-ring orb-ring-2"></div>
                <div class="orb-core">✦</div>
            </div>
            <div class="empty-title">Mousy's AI</div>
            <div class="empty-sub">${state.apiKey ? 'Start a conversation below.' : 'Save your API key in Settings to begin.'}</div>
        `;
        el.chatContainer.appendChild(empty);
        return;
    }

    chat.messages.forEach(msg => appendMessage(msg.role, msg.content, false));
    if (window.Prism) Prism.highlightAll();
    scrollBottom();
}

function appendMessage(role, content, animate = true) {
    const wrap = document.createElement('div');
    wrap.className = 'message-wrap' + (animate ? (' ' + (role === 'user' ? 'msg-in-right' : 'msg-in')) : '');

    if (role === 'user') {
        wrap.innerHTML = `<div class="user-bubble">${esc(content)}</div>`;
    } else if (role === 'error') {
        wrap.innerHTML = `<div class="error-bubble">${esc(content)}</div>`;
    } else {
        wrap.innerHTML = `<div class="ai-label">Mousy's AI</div><div class="message-content">${parseMd(content)}</div>`;
    }

    el.chatContainer.appendChild(wrap);
    return wrap;
}

function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'message-wrap msg-in';
    wrap.id = 'typingWrap';
    wrap.innerHTML = `
        <div class="ai-label">Mousy's AI</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    el.chatContainer.appendChild(wrap);
    scrollBottom();
    return wrap;
}

function hideTyping() {
    const t = document.getElementById('typingWrap');
    if (t) t.remove();
}

function setRetryNotice(wrap, attempt, delaySec) {
    let notice = wrap.querySelector('.retry-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.className = 'retry-notice';
        wrap.appendChild(notice);
    }
    notice.textContent = `Rate limited — retrying in ${delaySec}s (attempt ${attempt} of 3)…`;
}

async function callAPI(messages, model, typingWrap) {
    const MAX_RETRIES = 3;
    let attempt = 0;
    let delay = 8;

    while (true) {
        const res = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                instructions: state.settings.systemPrompt,
                input: messages,
                store: false
            })
        });

        if (res.status === 429) {
            attempt++;

            const body = await res.json().catch(() => ({}));
            const isQuota = body?.error?.code === 'insufficient_quota';

            if (isQuota) {
                throw { message: 'Your OpenAI quota is exhausted — check billing at platform.openai.com.' };
            }

            if (attempt > MAX_RETRIES) {
                throw { message: `Still rate limited after ${MAX_RETRIES} retries. Wait a minute and try again.` };
            }

            setRetryNotice(typingWrap, attempt, delay);
            await sleep(delay * 1000);
            delay = Math.min(delay * 2, 60);
            continue;
        }

        const data = await res.json();

        if (!res.ok) {
            const status = res.status;
            let msg = data?.error?.message || 'Unknown error.';
            if (status === 401) msg = 'Invalid API key — check Settings.';
            else if (status === 403) msg = 'Access denied — check your OpenAI account status.';
            else if (status === 400) msg = `Bad request: ${msg}`;
            else if (status === 404) msg = `Model "${model}" not found — try a different one.`;
            else if (status >= 500)  msg = 'OpenAI server error — try again in a moment.';
            throw { message: msg };
        }

        const outputMsg = data?.output?.find(o => o.type === 'message');
        const textBlock = outputMsg?.content?.find(c => c.type === 'output_text');

        if (!textBlock?.text) {
            throw { message: 'OpenAI returned an empty response. Try again.' };
        }

        return textBlock.text;
    }
}

async function sendMessage() {
    if (state.sending) return;

    const text = el.chatInput.value.trim();
    if (!text) { showToast('Type a message first.', 'error'); return; }

    if (!state.apiKey)                   { showToast('No API key — go to Settings and save one.', 'error'); return; }
    if (!state.apiKey.startsWith('sk-')) { showToast('Invalid API key — check Settings.', 'error'); return; }
    if (state.apiKey.length < 40)        { showToast('API key looks wrong — check Settings.', 'error'); return; }

    const chat = state.chats.find(c => c.id === state.currentId);
    if (!chat) return;

    if (chat.messages.length === 0) {
        chat.title = text.length > 30 ? text.substring(0, 30) + '…' : text;
        chat.model = el.modelSelect.value;
        el.modelSelect.disabled = true;
        renderHistory();
    }

    chat.messages.push({ role: 'user', content: text });
    el.chatInput.value = '';
    el.chatInput.style.height = 'auto';

    const existingEmpty = el.chatContainer.querySelector('.empty-state');
    if (existingEmpty) existingEmpty.remove();

    appendMessage('user', text, true);
    const typingWrap = showTyping();

    state.sending = true;
    el.sendBtn.disabled = true;

    try {
        const inputMessages = chat.messages.map(m => ({ role: m.role, content: m.content }));
        const aiText = await callAPI(inputMessages, chat.model, typingWrap);

        hideTyping();
        chat.messages.push({ role: 'assistant', content: aiText });
        appendMessage('assistant', aiText, true);
        if (window.Prism) Prism.highlightAll();
        saveChats();
        scrollBottom();

    } catch (err) {
        hideTyping();
        chat.messages.pop();
        appendMessage('error', err.message || 'Something went wrong.', true);
        saveChats();
    } finally {
        state.sending = false;
        el.sendBtn.disabled = false;
    }
}

function parseMd(text) {
    return text
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
            const l = lang || 'lua';
            const safe = code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<div class="code-block-container"><div class="code-header"><span>${l.toUpperCase()}</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div><pre><code class="language-${l}">${safe}</code></pre></div>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:#181818;padding:1px 6px;border-radius:5px;font-family:JetBrains Mono,monospace;font-size:0.83em">$1</code>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>').replace(/$/, '</p>');
}

function esc(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

function copyCode(btn) {
    const code = btn.closest('.code-block-container').querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
}

function scrollBottom() {
    requestAnimationFrame(() => {
        el.chatContainer.scrollTo({ top: el.chatContainer.scrollHeight, behavior: 'smooth' });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showToast(msg, type = 'default') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    el.toastContainer.appendChild(t);
    setTimeout(() => {
        t.classList.add('toast-out');
        setTimeout(() => t.remove(), 240);
    }, 2800);
}

function saveChats()    { localStorage.setItem('mousy_chats',    JSON.stringify(state.chats)); }
function saveSettings() { localStorage.setItem('mousy_settings', JSON.stringify(state.settings)); }

init();
