const GEMINI_MODELS = new Set([
    'gemini-3.1-pro',
    'gemini-3-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
]);

const THINKING_MODELS = new Set([
    'gemini-3.1-pro',
    'gemini-3-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash'
]);

const DEFAULT_MODEL = 'gemini-3-flash';
const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta/models';

const state = {
    chats:      JSON.parse(localStorage.getItem('mousy_chats') || '[]'),
    currentId:  null,
    settings:   JSON.parse(localStorage.getItem('mousy_settings') || 'null') || {
        systemPrompt: "You are Mousy's AI, a helpful and precise assistant. Format code in markdown code blocks with the language name."
    },
    geminiKey:  localStorage.getItem('mousy_gemini_key') || '',
    sending:    false,
    pendingImages: []
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
    geminiKeyInput:      document.getElementById('geminiKeyInput'),
    saveGeminiKeyBtn:    document.getElementById('saveGeminiKeyBtn'),
    toggleGeminiKeyBtn:  document.getElementById('toggleGeminiKeyBtn'),
    geminiKeyBadge:      document.getElementById('geminiKeyBadge'),
    wipeMemoryBtn:       document.getElementById('wipeMemoryBtn'),
    toastContainer:      document.getElementById('toastContainer'),
    imageInput:          document.getElementById('imageInput'),
    attachBtn:           document.getElementById('attachBtn'),
    imagePreviewBar:     document.getElementById('imagePreviewBar')
};

function init() {
    lucide.createIcons();
    el.systemPromptInput.value = state.settings.systemPrompt;
    el.geminiKeyInput.value    = state.geminiKey;
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

    el.chatInput.addEventListener('paste', e => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) addPendingImage(file);
            }
        }
    });

    el.openSettingsBtn.addEventListener('click', () => switchView('settings'));
    el.backToChat.addEventListener('click', () => switchView('chat'));
    el.saveGeminiKeyBtn.addEventListener('click', saveGeminiKey);
    el.saveSystemPromptBtn.addEventListener('click', saveSystemPrompt);

    el.toggleGeminiKeyBtn.addEventListener('click', () => {
        const show = el.geminiKeyInput.type === 'password';
        el.geminiKeyInput.type = show ? 'text' : 'password';
        el.toggleGeminiKeyBtn.innerHTML = show
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';
        lucide.createIcons();
    });

    el.imageInput.addEventListener('change', () => {
        Array.from(el.imageInput.files).forEach(addPendingImage);
        el.imageInput.value = '';
    });

    el.wipeMemoryBtn.addEventListener('click', () => {
        if (confirm('Delete all chats, settings and API key?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

function addPendingImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Only images are supported.', 'error');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showToast('Image must be under 10MB.', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const dataUrl  = e.target.result;
        const base64   = dataUrl.split(',')[1];
        const mimeType = file.type;
        const id       = Date.now() + Math.random();
        state.pendingImages.push({ id, base64, mimeType, dataUrl, name: file.name });
        renderImagePreviews();
    };
    reader.readAsDataURL(file);
}

function renderImagePreviews() {
    el.imagePreviewBar.innerHTML = '';
    if (state.pendingImages.length === 0) {
        el.imagePreviewBar.classList.remove('has-images');
        el.attachBtn.classList.remove('has-files');
        return;
    }
    el.imagePreviewBar.classList.add('has-images');
    el.attachBtn.classList.add('has-files');
    state.pendingImages.forEach(img => {
        const wrap = document.createElement('div');
        wrap.className = 'preview-thumb-wrap';
        wrap.innerHTML = `
            <img class="preview-thumb" src="${img.dataUrl}" alt="${esc(img.name)}">
            <button class="preview-remove" data-id="${img.id}" title="Remove">✕</button>
        `;
        wrap.querySelector('.preview-remove').addEventListener('click', () => {
            state.pendingImages = state.pendingImages.filter(i => i.id !== img.id);
            renderImagePreviews();
        });
        el.imagePreviewBar.appendChild(wrap);
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

function saveGeminiKey() {
    const raw = el.geminiKeyInput.value.trim();
    if (!raw)                   { showToast('Enter a key first.', 'error'); return; }
    if (!raw.startsWith('AIza')){ showToast('Gemini keys start with AIza, yours does not.', 'error'); return; }
    if (raw.length < 30)        { showToast('That key seems too short, double check it.', 'error'); return; }
    if (/\s/.test(raw))         { showToast('There are spaces in your key, remove them.', 'error'); return; }
    state.geminiKey = raw;
    localStorage.setItem('mousy_gemini_key', raw);
    updateKeyBadge();
    showToast('Gemini key saved.', 'success');
}

function saveSystemPrompt() {
    const val = el.systemPromptInput.value.trim();
    if (!val) { showToast('Prompt cannot be empty.', 'error'); return; }
    state.settings.systemPrompt = val;
    saveSettings();
    showToast('System prompt saved.', 'success');
}

function updateKeyBadge() {
    const ok = state.geminiKey && state.geminiKey.startsWith('AIza') && state.geminiKey.length >= 30;
    el.geminiKeyBadge.textContent = ok ? '● Active' : '● No Key';
    el.geminiKeyBadge.className   = 'key-badge ' + (ok ? 'has-key' : 'no-key');
}

function createNewChat() {
    const id    = Date.now().toString();
    const model = GEMINI_MODELS.has(el.modelSelect.value) ? el.modelSelect.value : DEFAULT_MODEL;
    state.chats.unshift({ id, title: 'New Chat', messages: [], model });
    state.currentId = id;
    saveChats();
    renderHistory();
    renderMessages();
    closeSidebarMobile();
}

function switchChat(id) {
    state.currentId = id;
    const chat = state.chats.find(c => c.id === id);
    if (!chat) return;
    el.modelSelect.value = GEMINI_MODELS.has(chat.model) ? chat.model : DEFAULT_MODEL;
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

el.modelSelect.addEventListener('change', () => {
    const chat = state.chats.find(c => c.id === state.currentId);
    if (chat) {
        chat.model = el.modelSelect.value;
        saveChats();
    }
});

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
            <div class="empty-sub">${state.geminiKey ? 'Start a conversation below. Images supported.' : 'Save your Gemini API key in Settings to begin.'}</div>
        `;
        el.chatContainer.appendChild(empty);
        return;
    }

    chat.messages.forEach(msg => appendMessage(msg.role, msg.content, msg.images || [], false));
    if (window.Prism) Prism.highlightAll();
    scrollBottom();
}

function appendMessage(role, content, images = [], animate = true) {
    const wrap = document.createElement('div');
    wrap.className = 'message-wrap' + (animate ? (' ' + (role === 'user' ? 'msg-in-right' : 'msg-in')) : '');

    if (role === 'user') {
        let imgHtml = '';
        if (images && images.length > 0) {
            imgHtml = `<div class="user-bubble-images">${images.map(img =>
                `<img class="user-bubble-img" src="data:${img.mimeType};base64,${img.base64}" alt="uploaded image">`
            ).join('')}</div>`;
        }
        wrap.innerHTML = `${imgHtml}<div class="user-bubble">${esc(content)}</div>`;
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
    notice.textContent = `Gemini is busy, trying again in ${delaySec}s (attempt ${attempt} of 3)...`;
}

function buildGeminiContents(messages) {
    return messages.map(msg => {
        const role  = msg.role === 'assistant' ? 'model' : 'user';
        const parts = [];

        if (msg.images && msg.images.length > 0) {
            msg.images.forEach(img => {
                parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
            });
        }

        if (msg.content) {
            parts.push({ text: msg.content });
        }

        return { role, parts };
    });
}

async function callGemini(messages, model, typingWrap) {
    const MAX_RETRIES = 3;
    let attempt = 0;
    let delay   = 8;

    const contents = buildGeminiContents(messages);

    const body = {
        contents,
        systemInstruction: {
            parts: [{ text: state.settings.systemPrompt }]
        },
        generationConfig: {}
    };

    if (THINKING_MODELS.has(model)) {
        body.generationConfig.thinkingConfig = { thinkingBudget: -1 };
    }

    while (true) {
        const url = `${GEMINI_BASE}/${model}:generateContent`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'x-goog-api-key': state.geminiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.status === 429) {
            attempt++;
            const body429 = await res.json().catch(() => ({}));
            const isQuota = body429?.error?.status === 'RESOURCE_EXHAUSTED' &&
                body429?.error?.message?.toLowerCase().includes('quota');

            if (isQuota) {
                throw { message: 'Looks like your Gemini quota ran out. You can check usage at aistudio.google.com.' };
            }
            if (attempt > MAX_RETRIES) {
                throw { message: `Still getting rate limited after ${MAX_RETRIES} attempts. Give it a minute and try again.` };
            }
            setRetryNotice(typingWrap, attempt, delay);
            await sleep(delay * 1000);
            delay = Math.min(delay * 2, 60);
            continue;
        }

        const data = await res.json();

        if (!res.ok) {
            const s   = res.status;
            let   msg = data?.error?.message || 'Something went wrong, please try again.';
            if (s === 400) {
                if (msg.toLowerCase().includes('api key')) {
                    msg = 'That Gemini key does not seem to be valid. Double check it in Settings.';
                } else {
                    msg = `Gemini could not process that request. ${msg}`;
                }
            } else if (s === 401 || s === 403) {
                msg = 'That Gemini key does not seem to be valid. Double check it in Settings.';
            } else if (s === 404) {
                msg = `The model "${model}" was not found. Try switching to a different one.`;
            } else if (s >= 500) {
                msg = 'Gemini is having some trouble on their end. Try again in a moment.';
            }
            throw { message: msg };
        }

        const candidate = data?.candidates?.[0];
        if (!candidate) {
            const reason = data?.promptFeedback?.blockReason;
            if (reason) {
                throw { message: `Gemini blocked that prompt (${reason}). Try rephrasing it.` };
            }
            throw { message: 'Got an empty response from Gemini. Try sending your message again.' };
        }

        const text = candidate.content?.parts
            ?.filter(p => p.text)
            ?.map(p => p.text)
            ?.join('') || '';

        if (!text) throw { message: 'Got an empty response from Gemini. Try sending your message again.' };
        return text;
    }
}

async function sendMessage() {
    if (state.sending) return;

    const text   = el.chatInput.value.trim();
    const images = [...state.pendingImages];

    if (!text && images.length === 0) {
        showToast('Type a message or attach an image first.', 'error');
        return;
    }

    if (!state.geminiKey) {
        showToast('Add your Gemini API key in Settings first.', 'error');
        return;
    }
    if (!state.geminiKey.startsWith('AIza')) {
        showToast('That Gemini key does not look right. Check Settings.', 'error');
        return;
    }

    const chat = state.chats.find(c => c.id === state.currentId);
    if (!chat) return;

    const model = el.modelSelect.value;
    chat.model  = model;

    if (chat.messages.length === 0 && text) {
        chat.title = text.length > 30 ? text.substring(0, 30) + '…' : text;
    } else if (chat.messages.length === 0 && images.length > 0) {
        chat.title = `Image${images.length > 1 ? 's' : ''} — ${model}`;
    }

    const userMsg = {
        role: 'user',
        content: text,
        images: images.map(img => ({ base64: img.base64, mimeType: img.mimeType }))
    };

    chat.messages.push(userMsg);

    el.chatInput.value = '';
    el.chatInput.style.height = 'auto';
    state.pendingImages = [];
    renderImagePreviews();

    const existingEmpty = el.chatContainer.querySelector('.empty-state');
    if (existingEmpty) existingEmpty.remove();

    appendMessage('user', text, userMsg.images, true);
    const typingWrap = showTyping();

    state.sending = true;
    el.sendBtn.disabled = true;

    try {
        const aiText = await callGemini(chat.messages, model, typingWrap);
        hideTyping();
        chat.messages.push({ role: 'assistant', content: aiText, images: [] });
        appendMessage('assistant', aiText, [], true);
        if (window.Prism) Prism.highlightAll();
        saveChats();
        renderHistory();
        scrollBottom();

    } catch (err) {
        hideTyping();
        chat.messages.pop();
        appendMessage('error', err.message || 'Something went wrong, please try again.', [], true);
        saveChats();
    } finally {
        state.sending = false;
        el.sendBtn.disabled = false;
    }
}

function parseMd(text) {
    return text
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
            const l    = lang || 'text';
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
