const state = {
    chats: JSON.parse(localStorage.getItem('mousy_chats')) || [],
    currentId: null,
    settings: JSON.parse(localStorage.getItem('mousy_settings')) || {
        systemPrompt: "You are Mousy's AI, a helpful and precise assistant. Use markdown for code blocks.",
    },
    apiKey: localStorage.getItem('mousy_apikey') || '',
    sending: false
};

const el = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('sidebarOverlay'),
    historyList: document.getElementById('historyList'),
    chatContainer: document.getElementById('chatContainer'),
    emptyState: document.getElementById('emptyState'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    modelSelect: document.getElementById('modelSelect'),
    newChatBtn: document.getElementById('newChatBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    backToChat: document.getElementById('backToChat'),
    chatView: document.getElementById('chatView'),
    settingsView: document.getElementById('settingsView'),
    systemPromptInput: document.getElementById('systemPromptInput'),
    saveSystemPromptBtn: document.getElementById('saveSystemPromptBtn'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    toggleKeyBtn: document.getElementById('toggleKeyBtn'),
    keyBadge: document.getElementById('keyBadge'),
    wipeMemoryBtn: document.getElementById('wipeMemoryBtn'),
    toastContainer: document.getElementById('toastContainer')
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

    el.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    el.chatInput.addEventListener('input', () => {
        el.chatInput.style.height = 'auto';
        el.chatInput.style.height = Math.min(el.chatInput.scrollHeight, 180) + 'px';
    });

    el.openSettingsBtn.addEventListener('click', () => switchView('settings'));
    el.backToChat.addEventListener('click', () => switchView('chat'));

    el.saveApiKeyBtn.addEventListener('click', saveApiKey);
    el.saveSystemPromptBtn.addEventListener('click', saveSystemPrompt);

    el.toggleKeyBtn.addEventListener('click', () => {
        const isPassword = el.apiKeyInput.type === 'password';
        el.apiKeyInput.type = isPassword ? 'text' : 'password';
        el.toggleKeyBtn.innerHTML = isPassword
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';
        lucide.createIcons();
    });

    el.wipeMemoryBtn.addEventListener('click', () => {
        if (confirm('This will delete all chats and settings. Continue?')) {
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

    from.classList.add('leaving');
    setTimeout(() => {
        from.classList.remove('active', 'leaving');
        to.classList.add('active', 'entering');
        lucide.createIcons();
        setTimeout(() => to.classList.remove('entering'), 400);
    }, 220);

    if (window.innerWidth <= 768) {
        el.sidebar.classList.remove('open');
        el.overlay.classList.remove('active');
    }
}

function saveApiKey() {
    const raw = el.apiKeyInput.value.trim();

    if (!raw) {
        showToast('Enter an API key first.', 'error');
        return;
    }

    if (!raw.startsWith('sk-')) {
        showToast('Key must start with sk-', 'error');
        return;
    }

    if (raw.length < 40) {
        showToast('Key looks too short. Check it.', 'error');
        return;
    }

    if (/\s/.test(raw)) {
        showToast('Key contains spaces. Remove them.', 'error');
        return;
    }

    state.apiKey = raw;
    localStorage.setItem('mousy_apikey', raw);
    updateKeyBadge();
    showToast('API key saved.', 'success');
}

function saveSystemPrompt() {
    const val = el.systemPromptInput.value.trim();
    if (!val) {
        showToast('Prompt cannot be empty.', 'error');
        return;
    }
    state.settings.systemPrompt = val;
    saveSettings();
    showToast('System prompt saved.', 'success');
}

function updateKeyBadge() {
    if (state.apiKey && state.apiKey.startsWith('sk-') && state.apiKey.length >= 40) {
        el.keyBadge.textContent = '● Active';
        el.keyBadge.className = 'key-badge has-key';
    } else {
        el.keyBadge.textContent = '● No Key';
        el.keyBadge.className = 'key-badge no-key';
    }
}

function createNewChat() {
    const id = Date.now().toString();
    state.chats.unshift({
        id,
        title: 'New Chat',
        messages: [],
        model: el.modelSelect.value
    });
    state.currentId = id;
    saveChats();
    renderHistory();
    renderMessages();
    el.modelSelect.disabled = false;
    if (window.innerWidth <= 768) {
        el.sidebar.classList.remove('open');
        el.overlay.classList.remove('active');
    }
}

function switchChat(id) {
    state.currentId = id;
    const chat = state.chats.find(c => c.id === id);
    if (!chat) return;
    el.modelSelect.value = chat.model || 'gpt-4o';
    el.modelSelect.disabled = chat.messages.length > 0;
    renderHistory();
    renderMessages();
    if (window.innerWidth <= 768) {
        el.sidebar.classList.remove('open');
        el.overlay.classList.remove('active');
    }
}

function renderHistory() {
    el.historyList.innerHTML = '';
    state.chats.forEach((chat, i) => {
        const btn = document.createElement('button');
        btn.className = `history-item ${chat.id === state.currentId ? 'active' : ''}`;
        btn.style.animationDelay = `${i * 0.03}s`;
        btn.innerHTML = `<i data-lucide="message-circle"></i><span>${escapeHtml(chat.title)}</span>`;
        btn.addEventListener('click', () => switchChat(chat.id));
        el.historyList.appendChild(btn);
    });
    lucide.createIcons();
}

function renderMessages() {
    const chat = state.chats.find(c => c.id === state.currentId);
    el.chatContainer.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.id = 'emptyState';
        empty.innerHTML = `
            <div class="empty-orb">
                <div class="orb-ring"></div>
                <div class="orb-ring orb-ring-2"></div>
                <div class="orb-core">✦</div>
            </div>
            <div class="empty-title">Mousy's AI</div>
            <div class="empty-sub">${state.apiKey ? 'Ask anything.' : 'Add your API key in Settings to start.'}</div>
        `;
        el.chatContainer.appendChild(empty);
        lucide.createIcons();
        return;
    }

    chat.messages.forEach((msg, i) => {
        appendMessageDOM(msg.role, msg.content, false);
    });

    if (window.Prism) Prism.highlightAll();
    scrollToBottom();
}

function appendMessageDOM(role, content, animate = true) {
    const wrap = document.createElement('div');
    wrap.className = 'message-wrap';

    if (animate) {
        wrap.classList.add(role === 'user' ? 'msg-anim-in-right' : 'msg-anim-in');
    }

    if (role === 'user') {
        wrap.innerHTML = `<div class="user-bubble">${escapeHtml(content)}</div>`;
    } else if (role === 'error') {
        wrap.innerHTML = `<div class="error-bubble">${escapeHtml(content)}</div>`;
    } else {
        wrap.innerHTML = `
            <div class="ai-label">Mousy's AI</div>
            <div class="message-content">${parseMarkdown(content)}</div>
        `;
    }

    el.chatContainer.appendChild(wrap);
    return wrap;
}

function appendTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'message-wrap msg-anim-in';
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
    scrollToBottom();
}

function removeTypingIndicator() {
    const t = document.getElementById('typingWrap');
    if (t) t.remove();
}

function parseMarkdown(text) {
    return text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        const language = lang || 'lua';
        const escaped = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `
            <div class="code-block-container">
                <div class="code-header">
                    <span>${language.toUpperCase()}</span>
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code class="language-${language}">${escaped}</code></pre>
            </div>
        `;
    }).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#1a1a1a;padding:2px 6px;border-radius:5px;font-family:JetBrains Mono,monospace;font-size:0.85em;">$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>').replace(/$/, '</p>');
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function sendMessage() {
    if (state.sending) return;

    const text = el.chatInput.value.trim();

    if (!text) {
        showToast('Type a message first.', 'error');
        return;
    }

    if (!state.apiKey) {
        showToast('No API key. Go to Settings and save one.', 'error');
        return;
    }

    if (!state.apiKey.startsWith('sk-')) {
        showToast('Invalid API key format. Check Settings.', 'error');
        return;
    }

    const chat = state.chats.find(c => c.id === state.currentId);
    if (!chat) return;

    if (chat.messages.length === 0) {
        chat.title = text.length > 28 ? text.substring(0, 28) + '…' : text;
        chat.model = el.modelSelect.value;
        el.modelSelect.disabled = true;
        renderHistory();
    }

    chat.messages.push({ role: 'user', content: text });
    el.chatInput.value = '';
    el.chatInput.style.height = 'auto';

    const existingEmpty = el.chatContainer.querySelector('.empty-state');
    if (existingEmpty) existingEmpty.remove();

    appendMessageDOM('user', text, true);
    appendTypingIndicator();
    scrollToBottom();

    state.sending = true;
    el.sendBtn.disabled = true;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: chat.model,
                messages: [
                    { role: 'system', content: state.settings.systemPrompt },
                    ...chat.messages
                ],
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        const data = await response.json();

        removeTypingIndicator();

        if (!response.ok) {
            const code = response.status;
            let msg = 'Something went wrong.';

            if (code === 401) msg = 'Invalid API key. Check Settings.';
            else if (code === 403) msg = 'Access denied. Check your OpenAI account.';
            else if (code === 429) msg = 'Rate limit or quota exceeded. Check your OpenAI billing.';
            else if (code === 400) msg = `Bad request: ${data?.error?.message || 'Check your model or prompt.'}`;
            else if (code === 404) msg = 'Model not found. Try a different model.';
            else if (code === 500 || code === 503) msg = 'OpenAI server error. Try again shortly.';
            else if (data?.error?.message) msg = data.error.message;

            chat.messages.pop();
            appendMessageDOM('error', msg, true);
            saveChats();
            return;
        }

        if (!data.choices || !data.choices[0]?.message?.content) {
            chat.messages.pop();
            appendMessageDOM('error', 'Empty response from API. Try again.', true);
            saveChats();
            return;
        }

        const aiText = data.choices[0].message.content;
        chat.messages.push({ role: 'assistant', content: aiText });

        appendMessageDOM('assistant', aiText, true);
        if (window.Prism) Prism.highlightAll();

        saveChats();
        saveSettings();
        scrollToBottom();

    } catch (err) {
        removeTypingIndicator();
        chat.messages.pop();

        let msg = 'Network error. Check your connection.';
        if (err.name === 'TypeError') msg = 'Could not reach OpenAI. Check your internet.';

        appendMessageDOM('error', msg, true);
        saveChats();
    } finally {
        state.sending = false;
        el.sendBtn.disabled = false;
    }
}

function copyCode(btn) {
    const code = btn.closest('.code-block-container').querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        el.chatContainer.scrollTo({
            top: el.chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
}

function showToast(msg, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 280);
    }, 2800);
}

function saveChats()    { localStorage.setItem('mousy_chats', JSON.stringify(state.chats)); }
function saveSettings() { localStorage.setItem('mousy_settings', JSON.stringify(state.settings)); }

init();
