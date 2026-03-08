const GEMINI_MODELS     = new Set(['gemini-2.5-pro','gemini-2.5-flash','gemini-2.5-flash-lite-preview-06-17','gemini-2.0-flash','gemini-1.5-pro','gemini-1.5-flash']);
const OR_IMAGE_MODELS   = new Set(['bytedance-seed/seedream-4.5']);
const OR_CHAT_MODELS    = new Set(['arcee-ai/trinity-large-preview:free','stepfun/step-3.5-flash:free']);
const GEMINI25_THINKING = new Set(['gemini-2.5-pro','gemini-2.5-flash']);
const OR_BASE           = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_BASE       = 'https://generativelanguage.googleapis.com/v1beta/models';

const SUPPORTED_LANGS = new Set([
  'javascript','js','typescript','ts','python','py','html','css','json','markdown','md',
  'bash','sh','shell','sql','yaml','yml','xml','java','c','cpp','c++','csharp','cs',
  'go','rust','php','ruby','rb','swift','kotlin','dart','r','scala','lua','perl',
  'text','plain','plaintext','txt','jsx','tsx','vue','svelte','graphql','toml','ini',
  'dockerfile','makefile','nginx','regex','diff','http','sass','scss','less','wasm',
  'powershell','ps1','batch','cmd','asm','assembly','vb','vba','matlab','julia'
]);

const GEMINI_MODEL_LIST = [
  {id:'gemini-2.5-pro',label:'Gemini 2.5 Pro',group:'Gemini',badge:'Smart'},
  {id:'gemini-2.5-flash',label:'Gemini 2.5 Flash',group:'Gemini',badge:'Fast'},
  {id:'gemini-2.5-flash-lite-preview-06-17',label:'Gemini 2.5 Flash Lite',group:'Gemini',badge:'Lite'},
  {id:'gemini-2.0-flash',label:'Gemini 2.0 Flash',group:'Gemini',badge:''},
  {id:'gemini-1.5-pro',label:'Gemini 1.5 Pro',group:'Gemini',badge:'2M ctx'},
  {id:'gemini-1.5-flash',label:'Gemini 1.5 Flash',group:'Gemini',badge:''},
];
const OR_MODEL_LIST = [
  {id:'arcee-ai/trinity-large-preview:free',label:'Trinity Large',group:'OpenRouter',badge:'Free'},
  {id:'stepfun/step-3.5-flash:free',label:'Step 3.5 Flash',group:'OpenRouter',badge:'Free'},
  {id:'bytedance-seed/seedream-4.5',label:'Seedream 4.5',group:'Image Gen',badge:'Image'},
];
const ALL_MODELS    = [...GEMINI_MODEL_LIST, ...OR_MODEL_LIST];
const DEFAULT_MODEL = 'gemini-2.5-flash';

const LANG_STRINGS = {
  en:{newChat:'New Chat',search:'Search chats…',settings:'Settings',typeMsg:'Type your message…',backToChat:'Back to Chat',
      profileSaved:'Profile saved.',keySaved:'Key saved.',keyEmpty:'Enter a key first.',keySpaces:'Remove spaces from the key.',
      geminiPrefix:'Gemini keys start with AIza.',geminiShort:'That key looks too short.',orPrefix:'OpenRouter keys start with sk-or-.',
      promptSaved:'System prompt saved.',promptEmpty:'Prompt cannot be empty.',accentSaved:'Accent color saved.',accentReset:'Accent reset.',
      exported:'Chat exported.',nothingExport:'Nothing to export.',cleared:'Chat cleared.',
      wipeConfirm:'Delete all chats and settings? This cannot be undone.',
      renameEmpty:'Name cannot be empty.',chatRenamed:'Chat renamed.',chatDeleted:'Chat deleted.',
      noChats:'No chats yet',noChatsFound:'No chats found',noModels:'No models found',
      imageOnly:'Only images are supported.',imageSize:'Image must be under 10 MB.',
      typeFirst:'Type a message or attach an image.',needGemini:'Add your Gemini API key in Settings.',
      needOr:'Add your OpenRouter API key in Settings.',clearConfirm:'Clear all messages in this chat?',
      enterSends:'Enter sends message.',ctrlEnterSends:'Ctrl+Enter sends message.',
      unsupported:'I can only generate code in supported languages for this app. Please ask for JavaScript, Python, HTML, CSS, etc.',
      fallback:"I'm not able to help with that. Please ask me something appropriate!",
      startConvo:'Start a conversation below.'},
  nl:{newChat:'Nieuw gesprek',search:'Gesprekken zoeken…',settings:'Instellingen',typeMsg:'Typ je bericht…',backToChat:'Terug naar chat',
      profileSaved:'Profiel opgeslagen.',keySaved:'Sleutel opgeslagen.',keyEmpty:'Voer eerst een sleutel in.',keySpaces:'Verwijder spaties uit de sleutel.',
      geminiPrefix:'Gemini-sleutels beginnen met AIza.',geminiShort:'Die sleutel lijkt te kort.',orPrefix:'OpenRouter-sleutels beginnen met sk-or-.',
      promptSaved:'Systeemprompt opgeslagen.',promptEmpty:'Prompt mag niet leeg zijn.',accentSaved:'Accentkleur opgeslagen.',accentReset:'Accent gereset.',
      exported:'Gesprek geëxporteerd.',nothingExport:'Niets te exporteren.',cleared:'Gesprek gewist.',
      wipeConfirm:'Alle gesprekken en instellingen verwijderen? Dit kan niet ongedaan worden gemaakt.',
      renameEmpty:'Naam mag niet leeg zijn.',chatRenamed:'Gesprek hernoemd.',chatDeleted:'Gesprek verwijderd.',
      noChats:'Nog geen gesprekken',noChatsFound:'Geen gesprekken gevonden',noModels:'Geen modellen gevonden',
      imageOnly:'Alleen afbeeldingen worden ondersteund.',imageSize:'Afbeelding moet kleiner zijn dan 10 MB.',
      typeFirst:'Typ een bericht of voeg een afbeelding toe.',needGemini:'Voeg je Gemini API-sleutel toe in de instellingen.',
      needOr:'Voeg je OpenRouter API-sleutel toe in de instellingen.',clearConfirm:'Alle berichten in dit gesprek wissen?',
      enterSends:'Enter verstuurt bericht.',ctrlEnterSends:'Ctrl+Enter verstuurt bericht.',
      unsupported:'Ik kan alleen code genereren in ondersteunde talen voor deze app. Vraag om JavaScript, Python, HTML, CSS, enz.',
      fallback:'Ik kan daarmee niet helpen. Stel een gepaste vraag!',
      startConvo:'Begin hieronder een gesprek.'},
  de:{newChat:'Neues Gespräch',search:'Gespräche suchen…',settings:'Einstellungen',typeMsg:'Nachricht eingeben…',backToChat:'Zurück zum Chat',
      profileSaved:'Profil gespeichert.',keySaved:'Schlüssel gespeichert.',keyEmpty:'Zuerst einen Schlüssel eingeben.',keySpaces:'Leerzeichen aus dem Schlüssel entfernen.',
      geminiPrefix:'Gemini-Schlüssel beginnen mit AIza.',geminiShort:'Dieser Schlüssel scheint zu kurz.',orPrefix:'OpenRouter-Schlüssel beginnen mit sk-or-.',
      promptSaved:'Systemprompt gespeichert.',promptEmpty:'Prompt darf nicht leer sein.',accentSaved:'Akzentfarbe gespeichert.',accentReset:'Akzent zurückgesetzt.',
      exported:'Chat exportiert.',nothingExport:'Nichts zu exportieren.',cleared:'Chat geleert.',
      wipeConfirm:'Alle Chats und Einstellungen löschen? Dies kann nicht rückgängig gemacht werden.',
      renameEmpty:'Name darf nicht leer sein.',chatRenamed:'Chat umbenannt.',chatDeleted:'Chat gelöscht.',
      noChats:'Noch keine Gespräche',noChatsFound:'Keine Gespräche gefunden',noModels:'Keine Modelle gefunden',
      imageOnly:'Nur Bilder werden unterstützt.',imageSize:'Bild muss kleiner als 10 MB sein.',
      typeFirst:'Nachricht eingeben oder Bild anhängen.',needGemini:'Füge deinen Gemini-API-Schlüssel in den Einstellungen hinzu.',
      needOr:'Füge deinen OpenRouter-API-Schlüssel in den Einstellungen hinzu.',clearConfirm:'Alle Nachrichten in diesem Chat löschen?',
      enterSends:'Enter sendet Nachricht.',ctrlEnterSends:'Ctrl+Enter sendet Nachricht.',
      unsupported:'Ich kann nur Code in unterstützten Sprachen für diese App generieren. Bitte frage nach JavaScript, Python, HTML, CSS usw.',
      fallback:'Ich kann dabei nicht helfen. Bitte stelle eine angemessene Frage!',
      startConvo:'Beginne unten ein Gespräch.'},
  es:{newChat:'Nueva conversación',search:'Buscar chats…',settings:'Configuración',typeMsg:'Escribe tu mensaje…',backToChat:'Volver al chat',
      profileSaved:'Perfil guardado.',keySaved:'Clave guardada.',keyEmpty:'Introduce una clave primero.',keySpaces:'Elimina espacios de la clave.',
      geminiPrefix:'Las claves de Gemini comienzan con AIza.',geminiShort:'Esa clave parece demasiado corta.',orPrefix:'Las claves de OpenRouter comienzan con sk-or-.',
      promptSaved:'Instrucción del sistema guardada.',promptEmpty:'La instrucción no puede estar vacía.',accentSaved:'Color de acento guardado.',accentReset:'Acento restablecido.',
      exported:'Chat exportado.',nothingExport:'Nada que exportar.',cleared:'Chat borrado.',
      wipeConfirm:'¿Eliminar todos los chats y configuraciones? Esto no se puede deshacer.',
      renameEmpty:'El nombre no puede estar vacío.',chatRenamed:'Chat renombrado.',chatDeleted:'Chat eliminado.',
      noChats:'Sin conversaciones aún',noChatsFound:'No se encontraron chats',noModels:'No se encontraron modelos',
      imageOnly:'Solo se admiten imágenes.',imageSize:'La imagen debe ser menor de 10 MB.',
      typeFirst:'Escribe un mensaje o adjunta una imagen.',needGemini:'Agrega tu clave de Gemini en Configuración.',
      needOr:'Agrega tu clave de OpenRouter en Configuración.',clearConfirm:'¿Borrar todos los mensajes de este chat?',
      enterSends:'Enter envía mensaje.',ctrlEnterSends:'Ctrl+Enter envía mensaje.',
      unsupported:'Solo puedo generar código en lenguajes compatibles para esta app. Pide JavaScript, Python, HTML, CSS, etc.',
      fallback:'No puedo ayudarte con eso. ¡Por favor hazme una pregunta adecuada!',
      startConvo:'Comienza una conversación abajo.'},
  fr:{newChat:'Nouvelle conversation',search:'Rechercher…',settings:'Paramètres',typeMsg:'Tapez votre message…',backToChat:'Retour au chat',
      profileSaved:'Profil enregistré.',keySaved:'Clé enregistrée.',keyEmpty:"Entrez d'abord une clé.",keySpaces:'Supprimez les espaces de la clé.',
      geminiPrefix:'Les clés Gemini commencent par AIza.',geminiShort:'Cette clé semble trop courte.',orPrefix:'Les clés OpenRouter commencent par sk-or-.',
      promptSaved:'Invite système enregistrée.',promptEmpty:"L'invite ne peut pas être vide.",accentSaved:"Couleur d'accent enregistrée.",accentReset:'Accent réinitialisé.',
      exported:'Chat exporté.',nothingExport:'Rien à exporter.',cleared:'Chat effacé.',
      wipeConfirm:'Supprimer tous les chats et paramètres? Cela ne peut pas être annulé.',
      renameEmpty:'Le nom ne peut pas être vide.',chatRenamed:'Chat renommé.',chatDeleted:'Chat supprimé.',
      noChats:'Pas encore de conversations',noChatsFound:'Aucun chat trouvé',noModels:'Aucun modèle trouvé',
      imageOnly:'Seules les images sont acceptées.',imageSize:"L'image doit faire moins de 10 Mo.",
      typeFirst:'Tapez un message ou joignez une image.',needGemini:'Ajoutez votre clé Gemini dans les paramètres.',
      needOr:'Ajoutez votre clé OpenRouter dans les paramètres.',clearConfirm:'Effacer tous les messages de ce chat?',
      enterSends:'Entrée envoie le message.',ctrlEnterSends:'Ctrl+Entrée envoie le message.',
      unsupported:'Je ne peux générer du code que dans les langages pris en charge pour cette app. Demandez JavaScript, Python, HTML, CSS, etc.',
      fallback:'Je ne peux pas vous aider avec ça. Veuillez poser une question appropriée!',
      startConvo:'Commencez une conversation ci-dessous.'},
  pt:{newChat:'Nova conversa',search:'Pesquisar chats…',settings:'Configurações',typeMsg:'Digite sua mensagem…',backToChat:'Voltar ao chat',
      profileSaved:'Perfil salvo.',keySaved:'Chave salva.',keyEmpty:'Insira uma chave primeiro.',keySpaces:'Remova espaços da chave.',
      geminiPrefix:'Chaves Gemini começam com AIza.',geminiShort:'Essa chave parece curta demais.',orPrefix:'Chaves OpenRouter começam com sk-or-.',
      promptSaved:'Instrução do sistema salva.',promptEmpty:'A instrução não pode estar vazia.',accentSaved:'Cor de destaque salva.',accentReset:'Destaque redefinido.',
      exported:'Chat exportado.',nothingExport:'Nada para exportar.',cleared:'Chat limpo.',
      wipeConfirm:'Excluir todos os chats e configurações? Isso não pode ser desfeito.',
      renameEmpty:'O nome não pode estar vazio.',chatRenamed:'Chat renomeado.',chatDeleted:'Chat excluído.',
      noChats:'Sem conversas ainda',noChatsFound:'Nenhum chat encontrado',noModels:'Nenhum modelo encontrado',
      imageOnly:'Apenas imagens são suportadas.',imageSize:'A imagem deve ter menos de 10 MB.',
      typeFirst:'Digite uma mensagem ou anexe uma imagem.',needGemini:'Adicione sua chave Gemini nas configurações.',
      needOr:'Adicione sua chave OpenRouter nas configurações.',clearConfirm:'Limpar todas as mensagens deste chat?',
      enterSends:'Enter envia mensagem.',ctrlEnterSends:'Ctrl+Enter envia mensagem.',
      unsupported:'Só posso gerar código em linguagens suportadas para este app. Peça JavaScript, Python, HTML, CSS, etc.',
      fallback:'Não posso ajudar com isso. Por favor, faça uma pergunta adequada!',
      startConvo:'Comece uma conversa abaixo.'},
  zh:{newChat:'新对话',search:'搜索对话…',settings:'设置',typeMsg:'输入消息…',backToChat:'返回聊天',
      profileSaved:'个人资料已保存。',keySaved:'密钥已保存。',keyEmpty:'请先输入密钥。',keySpaces:'请删除密钥中的空格。',
      geminiPrefix:'Gemini 密钥以 AIza 开头。',geminiShort:'密钥看起来太短了。',orPrefix:'OpenRouter 密钥以 sk-or- 开头。',
      promptSaved:'系统提示已保存。',promptEmpty:'提示不能为空。',accentSaved:'强调色已保存。',accentReset:'强调色已重置。',
      exported:'对话已导出。',nothingExport:'没有可导出的内容。',cleared:'对话已清空。',
      wipeConfirm:'删除所有对话和设置？此操作无法撤销。',
      renameEmpty:'名称不能为空。',chatRenamed:'对话已重命名。',chatDeleted:'对话已删除。',
      noChats:'暂无对话',noChatsFound:'未找到对话',noModels:'未找到模型',
      imageOnly:'仅支持图片。',imageSize:'图片必须小于 10 MB。',
      typeFirst:'输入消息或附加图片。',needGemini:'请在设置中添加 Gemini API 密钥。',
      needOr:'请在设置中添加 OpenRouter API 密钥。',clearConfirm:'清空此对话中的所有消息？',
      enterSends:'Enter 发送消息。',ctrlEnterSends:'Ctrl+Enter 发送消息。',
      unsupported:'我只能为此应用生成受支持语言的代码。请要求 JavaScript、Python、HTML、CSS 等。',
      fallback:'我无法帮助您解决这个问题。请提出适当的问题！',
      startConvo:'在下方开始对话。'},
  ja:{newChat:'新しい会話',search:'会話を検索…',settings:'設定',typeMsg:'メッセージを入力…',backToChat:'チャットに戻る',
      profileSaved:'プロフィールを保存しました。',keySaved:'キーを保存しました。',keyEmpty:'まずキーを入力してください。',keySpaces:'キーからスペースを削除してください。',
      geminiPrefix:'Gemini キーは AIza で始まります。',geminiShort:'キーが短すぎます。',orPrefix:'OpenRouter キーは sk-or- で始まります。',
      promptSaved:'システムプロンプトを保存しました。',promptEmpty:'プロンプトは空にできません。',accentSaved:'アクセントカラーを保存しました。',accentReset:'アクセントをリセットしました。',
      exported:'会話をエクスポートしました。',nothingExport:'エクスポートするものがありません。',cleared:'会話を消去しました。',
      wipeConfirm:'すべての会話と設定を削除しますか？この操作は元に戻せません。',
      renameEmpty:'名前は空にできません。',chatRenamed:'会話の名前を変更しました。',chatDeleted:'会話を削除しました。',
      noChats:'会話がまだありません',noChatsFound:'会話が見つかりません',noModels:'モデルが見つかりません',
      imageOnly:'画像のみサポートされています。',imageSize:'画像は10MB未満にしてください。',
      typeFirst:'メッセージを入力するか画像を添付してください。',needGemini:'設定で Gemini API キーを追加してください。',
      needOr:'設定で OpenRouter API キーを追加してください。',clearConfirm:'この会話のすべてのメッセージを消去しますか？',
      enterSends:'Enter でメッセージを送信。',ctrlEnterSends:'Ctrl+Enter でメッセージを送信。',
      unsupported:'このアプリでサポートされている言語のコードのみ生成できます。JavaScript、Python、HTML、CSS などをリクエストしてください。',
      fallback:'それについてお手伝いできません。適切なことを聞いてください！',
      startConvo:'下に会話を始めましょう。'},
  ar:{newChat:'محادثة جديدة',search:'البحث في المحادثات…',settings:'الإعدادات',typeMsg:'اكتب رسالتك…',backToChat:'العودة إلى الدردشة',
      profileSaved:'تم حفظ الملف الشخصي.',keySaved:'تم حفظ المفتاح.',keyEmpty:'أدخل مفتاحاً أولاً.',keySpaces:'أزل المسافات من المفتاح.',
      geminiPrefix:'تبدأ مفاتيح Gemini بـ AIza.',geminiShort:'يبدو المفتاح قصيراً جداً.',orPrefix:'تبدأ مفاتيح OpenRouter بـ sk-or-.',
      promptSaved:'تم حفظ موجه النظام.',promptEmpty:'لا يمكن أن يكون الموجه فارغاً.',accentSaved:'تم حفظ لون التمييز.',accentReset:'تمت إعادة تعيين لون التمييز.',
      exported:'تم تصدير المحادثة.',nothingExport:'لا يوجد شيء للتصدير.',cleared:'تم مسح المحادثة.',
      wipeConfirm:'حذف جميع المحادثات والإعدادات؟ لا يمكن التراجع عن هذا.',
      renameEmpty:'لا يمكن أن يكون الاسم فارغاً.',chatRenamed:'تمت إعادة تسمية المحادثة.',chatDeleted:'تم حذف المحادثة.',
      noChats:'لا توجد محادثات بعد',noChatsFound:'لم يتم العثور على محادثات',noModels:'لم يتم العثور على نماذج',
      imageOnly:'الصور فقط مدعومة.',imageSize:'يجب أن تكون الصورة أقل من 10 ميغابايت.',
      typeFirst:'اكتب رسالة أو أرفق صورة.',needGemini:'أضف مفتاح Gemini API في الإعدادات.',
      needOr:'أضف مفتاح OpenRouter API في الإعدادات.',clearConfirm:'مسح جميع الرسائل في هذه المحادثة؟',
      enterSends:'Enter يرسل الرسالة.',ctrlEnterSends:'Ctrl+Enter يرسل الرسالة.',
      unsupported:'يمكنني فقط إنشاء كود بلغات مدعومة لهذا التطبيق. اطلب JavaScript أو Python أو HTML أو CSS وما إلى ذلك.',
      fallback:'لا أستطيع مساعدتك في ذلك. من فضلك اسأل شيئاً مناسباً!',
      startConvo:'ابدأ محادثة أدناه.'},
  hi:{newChat:'नई बातचीत',search:'बातचीत खोजें…',settings:'सेटिंग्स',typeMsg:'संदेश टाइप करें…',backToChat:'चैट पर वापस जाएं',
      profileSaved:'प्रोफ़ाइल सहेजी गई।',keySaved:'कुंजी सहेजी गई।',keyEmpty:'पहले एक कुंजी दर्ज करें।',keySpaces:'कुंजी से रिक्त स्थान हटाएं।',
      geminiPrefix:'Gemini कुंजियां AIza से शुरू होती हैं।',geminiShort:'वह कुंजी बहुत छोटी लगती है।',orPrefix:'OpenRouter कुंजियां sk-or- से शुरू होती हैं।',
      promptSaved:'सिस्टम प्रॉम्प्ट सहेजा गया।',promptEmpty:'प्रॉम्प्ट खाली नहीं हो सकता।',accentSaved:'उच्चारण रंग सहेजा गया।',accentReset:'उच्चारण रीसेट हो गया।',
      exported:'बातचीत निर्यात की गई।',nothingExport:'निर्यात करने के लिए कुछ नहीं।',cleared:'बातचीत साफ की गई।',
      wipeConfirm:'सभी बातचीत और सेटिंग्स हटाएं? यह पूर्ववत नहीं किया जा सकता।',
      renameEmpty:'नाम खाली नहीं हो सकता।',chatRenamed:'बातचीत का नाम बदला गया।',chatDeleted:'बातचीत हटाई गई।',
      noChats:'अभी तक कोई बातचीत नहीं',noChatsFound:'कोई बातचीत नहीं मिली',noModels:'कोई मॉडल नहीं मिला',
      imageOnly:'केवल छवियां समर्थित हैं।',imageSize:'छवि 10 MB से कम होनी चाहिए।',
      typeFirst:'संदेश टाइप करें या छवि संलग्न करें।',needGemini:'सेटिंग्स में अपनी Gemini API कुंजी जोड़ें।',
      needOr:'सेटिंग्स में अपनी OpenRouter API कुंजी जोड़ें।',clearConfirm:'इस बातचीत के सभी संदेश साफ करें?',
      enterSends:'Enter संदेश भेजता है।',ctrlEnterSends:'Ctrl+Enter संदेश भेजता है।',
      unsupported:'मैं केवल इस ऐप के लिए समर्थित भाषाओं में कोड बना सकता हूं। JavaScript, Python, HTML, CSS आदि मांगें।',
      fallback:'मैं इसमें मदद नहीं कर सकता। कृपया कुछ उचित पूछें!',
      startConvo:'नीचे एक बातचीत शुरू करें।'},
};

function tr(key) {
  const lang = state && state.settings ? (state.settings.language||'en') : 'en';
  return (LANG_STRINGS[lang]||LANG_STRINGS.en)[key] || LANG_STRINGS.en[key] || key;
}

const defaultSettings = {
  systemPrompt:  'You are a helpful, precise AI assistant. Format code in markdown code blocks with the language name.',
  textEffect:    'fade-in',
  fontSize:      'md',
  theme:         'dark',
  chatFont:      'Plus Jakarta Sans',
  responseStyle: 'professional',
  emojiLevel:    'none',
  profileName:   'User',
  accentColor:   '#ffffff',
  renderMarkdown:true,
  sendOnEnter:   true,
  showTimestamps:false,
  compactMode:   true,
  scriptComments:false,
  language:      'en',
};

const savedSettings = (()=>{try{return JSON.parse(localStorage.getItem('mousy_settings')||'{}')}catch{return{}}})();
const state = {
  chats:        (()=>{try{return JSON.parse(localStorage.getItem('mousy_chats')||'[]')}catch{return[]}})(),
  currentId:    null,
  settings:     Object.assign({},defaultSettings,savedSettings),
  geminiKey:    localStorage.getItem('mousy_gemini_key')||'',
  openRouterKey:localStorage.getItem('mousy_or_key')||'',
  currentModel: localStorage.getItem('mousy_model')||DEFAULT_MODEL,
  sending:      false,
  pendingImages:[],
  searchQuery:  '',
  autoThemeTimer:null,
};

const q = id => document.getElementById(id);
const el = {
  sidebar:q('sidebar'),overlay:q('sidebarOverlay'),historyList:q('historyList'),
  chatContainer:q('chatContainer'),chatInput:q('chatInput'),sendBtn:q('sendBtn'),
  newChatBtn:q('newChatBtn'),openSettingsBtn:q('openSettingsBtn'),backToChat:q('backToChat'),
  chatView:q('chatView'),settingsView:q('settingsView'),
  systemPromptInput:q('systemPromptInput'),saveSystemPromptBtn:q('saveSystemPromptBtn'),
  geminiKeyInput:q('geminiKeyInput'),saveGeminiKeyBtn:q('saveGeminiKeyBtn'),toggleGeminiKeyBtn:q('toggleGeminiKeyBtn'),
  orKeyInput:q('orKeyInput'),saveOrKeyBtn:q('saveOrKeyBtn'),toggleOrKeyBtn:q('toggleOrKeyBtn'),
  wipeMemoryBtn:q('wipeMemoryBtn'),toastContainer:q('toastContainer'),
  imageInput:q('imageInput'),attachBtn:q('attachBtn'),imagePreviewBar:q('imagePreviewBar'),
  chatSearch:q('chatSearch'),searchClear:q('searchClear'),
  chatModal:q('chatModal'),modalTitle:q('modalTitle'),modalInput:q('modalInput'),
  modalCancel:q('modalCancel'),modalConfirm:q('modalConfirm'),
  modelTrigger:q('modelTrigger'),modelTriggerLabel:q('modelTriggerLabel'),
  modelDropdownRoot:q('modelDropdownRoot'),modelSearchInput:q('modelSearchInput'),modelPanelList:q('modelPanelList'),
  profileNameInput:q('profileNameInput'),saveProfileBtn:q('saveProfileBtn'),
  renderMarkdownToggle:q('renderMarkdownToggle'),sendOnEnterToggle:q('sendOnEnterToggle'),
  showTimestampsToggle:q('showTimestampsToggle'),compactModeToggle:q('compactModeToggle'),
  scriptCommentsToggle:q('scriptCommentsToggle'),
  accentColorInput:q('accentColorInput'),accentColorHex:q('accentColorHex'),
  saveAccentBtn:q('saveAccentBtn'),resetAccentBtn:q('resetAccentBtn'),
  exportChatBtn:q('exportChatBtn'),clearChatBtn:q('clearChatBtn'),charCounter:q('charCounter'),
};

function init() {
  lucide.createIcons();
  el.systemPromptInput.value = state.settings.systemPrompt;
  el.profileNameInput.value  = state.settings.profileName||'User';
  el.geminiKeyInput.value    = state.geminiKey;
  el.orKeyInput.value        = state.openRouterKey;
  const accent = state.settings.accentColor||'#ffffff';
  el.accentColorInput.value  = accent;
  el.accentColorHex.value    = accent;
  applyTheme(state.settings.theme, false);
  applyAccentColor(accent, false);
  document.querySelectorAll('.accent-preset').forEach(b=>b.classList.toggle('active',b.dataset.color===accent));
  applyFontSize(state.settings.fontSize);
  applyChatFont(state.settings.chatFont);
  applyCompactMode(state.settings.compactMode);
  syncToggle(el.renderMarkdownToggle,  state.settings.renderMarkdown!==false);
  syncToggle(el.sendOnEnterToggle,     state.settings.sendOnEnter!==false);
  syncToggle(el.showTimestampsToggle,  state.settings.showTimestamps===true);
  syncToggle(el.compactModeToggle,     state.settings.compactMode===true);
  syncToggle(el.scriptCommentsToggle,  state.settings.scriptComments===true);
  syncSelectUI('responseStyleSelect',  state.settings.responseStyle);
  syncSelectUI('emojiLevelSelect',     state.settings.emojiLevel);
  syncSelectUI('themeSelect',          state.settings.theme);
  syncSelectUI('chatFontSelect',       state.settings.chatFont);
  syncSelectUI('fontSizeSelect',       state.settings.fontSize);
  syncSelectUI('effectSelect',         state.settings.textEffect);
  syncSelectUI('languageSelect',       state.settings.language);
  buildModelPanel('');
  setModelTriggerLabel(state.currentModel);
  initAccordion();
  if(state.chats.length>0) switchChat(state.chats[0].id);
  else createNewChat();
  bindEvents();
  renderHistory();
}

function initAccordion() {
  document.querySelectorAll('.acc-header').forEach(hdr=>{
    hdr.addEventListener('click',()=>{
      const item=hdr.closest('.acc-item');
      const isOpen=item.classList.contains('open');
      document.querySelectorAll('.acc-item').forEach(i=>i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });
}

function buildSystemPrompt() {
  const name     = state.settings.profileName||'User';
  const style    = state.settings.responseStyle||'professional';
  const emoji    = state.settings.emojiLevel||'none';
  const comments = state.settings.scriptComments===true;
  const base     = state.settings.systemPrompt||defaultSettings.systemPrompt;
  const styleMap = {
    professional:'Respond in a professional, clear and concise manner.',
    friendly:'Respond in a warm, friendly and approachable way.',
    nerdy:'Respond with enthusiasm, technical depth and nerdy energy.',
    sincere:'Respond sincerely and thoughtfully with genuine care.',
    concise:'Be extremely concise — 1 to 3 sentences unless truly more is needed.',
    socratic:'Guide with Socratic questions rather than direct answers.',
    stoic:'Respond with stoic composure: calm, logical, no fluff.',
    poetic:'Express ideas with poetic language, metaphors and elegance.',
    analytical:'Analyse deeply and systematically, presenting structured reasoning.',
    humorous:'Be helpful but add lighthearted humour where natural.',
  };
  const emojiMap = {
    none:'Do not use any emojis.',
    less:'Use very few emojis, only when truly appropriate.',
    more:'Feel free to use emojis to make responses fun and expressive.',
  };
  const supportedList='javascript, python, html, css, json, bash, sql, yaml, xml, java, c, cpp, csharp, go, rust, php, ruby, swift, kotlin, dart, typescript, r, scala, lua, perl, text, markdown, jsx, tsx, vue, svelte, graphql, toml, ini, dockerfile, powershell, sass, scss, less';
  let p=`${base}\n\nThe user's name is ${name}. Address them by name occasionally.\n${styleMap[style]||''}\n${emojiMap[emoji]||''}`;
  p+=`\n\nCRITICAL RULES — follow these at all times, no exceptions:\n`;
  p+=`1. CODE LANGUAGE RESTRICTION: Only generate code in these supported languages: ${supportedList}. If the user asks for code in ANY other language (e.g. COBOL, Brainfuck, Haskell, etc.), you MUST refuse and respond ONLY with: "${tr('unsupported')}". Never generate unsupported code even if the user insists, rephrases, or claims exceptions.\n`;
  p+=`2. APPROPRIATE CONTENT: If asked something harmful, offensive, illegal, sexually explicit, or completely off-topic/nonsensical, respond ONLY with: "${tr('fallback')}". Do not engage with the topic.\n`;
  if(!comments) p+=`3. NO CODE COMMENTS: Do NOT add any comments or documentation to generated code unless the user explicitly asks for comments in that specific message. This applies to all languages and all AI models.\n`;
  return p.trim();
}

function bindEvents() {
  q('menuToggle').addEventListener('click',toggleSidebar);
  el.overlay.addEventListener('click',()=>{closeSidebarMobile();closeAllPanels();});
  el.newChatBtn.addEventListener('click',createNewChat);
  el.sendBtn.addEventListener('click',sendMessage);
  el.chatInput.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    if(state.settings.sendOnEnter ? !e.shiftKey : e.ctrlKey){e.preventDefault();sendMessage();}
  });
  el.chatInput.addEventListener('input',()=>{
    el.chatInput.style.height='auto';
    el.chatInput.style.height=Math.min(el.chatInput.scrollHeight,160)+'px';
    updateCharCounter();
  });
  el.chatInput.addEventListener('paste',e=>{
    const items=e.clipboardData?.items; if(!items) return;
    for(const item of items){if(item.type.startsWith('image/')){const f=item.getAsFile();if(f)addPendingImage(f);}}
  });
  el.openSettingsBtn.addEventListener('click',()=>switchView('settings'));
  el.backToChat.addEventListener('click',()=>{switchView('chat');if(state.currentId)renderMessages();});
  el.saveGeminiKeyBtn.addEventListener('click',saveGeminiKey);
  el.toggleGeminiKeyBtn.addEventListener('click',()=>togglePwField(el.geminiKeyInput,el.toggleGeminiKeyBtn));
  el.saveOrKeyBtn.addEventListener('click',saveOrKey);
  el.toggleOrKeyBtn.addEventListener('click',()=>togglePwField(el.orKeyInput,el.toggleOrKeyBtn));
  el.saveSystemPromptBtn.addEventListener('click',saveSystemPrompt);
  el.saveProfileBtn.addEventListener('click',()=>{
    state.settings.profileName=el.profileNameInput.value.trim()||'User';
    saveSettings();showToast(tr('profileSaved'),'success');
  });
  el.renderMarkdownToggle.addEventListener('click',()=>{
    const n=!(state.settings.renderMarkdown!==false);
    state.settings.renderMarkdown=n;syncToggle(el.renderMarkdownToggle,n);saveSettings();renderMessages();
  });
  el.sendOnEnterToggle.addEventListener('click',()=>{
    const n=!(state.settings.sendOnEnter!==false);
    state.settings.sendOnEnter=n;syncToggle(el.sendOnEnterToggle,n);saveSettings();
    showToast(n?tr('enterSends'):tr('ctrlEnterSends'),'default');
  });
  el.showTimestampsToggle.addEventListener('click',()=>{
    const n=!(state.settings.showTimestamps===true);
    state.settings.showTimestamps=n;syncToggle(el.showTimestampsToggle,n);saveSettings();renderMessages();
  });
  el.compactModeToggle.addEventListener('click',()=>{
    const n=!(state.settings.compactMode===true);
    state.settings.compactMode=n;syncToggle(el.compactModeToggle,n);applyCompactMode(n);saveSettings();
  });
  el.scriptCommentsToggle.addEventListener('click',()=>{
    const n=!(state.settings.scriptComments===true);
    state.settings.scriptComments=n;syncToggle(el.scriptCommentsToggle,n);saveSettings();
  });
  el.accentColorInput.addEventListener('input',()=>{el.accentColorHex.value=el.accentColorInput.value;});
  el.accentColorHex.addEventListener('input',()=>{
    const v=el.accentColorHex.value.trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v)) el.accentColorInput.value=v;
  });
  el.saveAccentBtn.addEventListener('click',()=>{
    const v=el.accentColorInput.value;state.settings.accentColor=v;
    el.accentColorHex.value=v;applyAccentColor(v,true);saveSettings();showToast(tr('accentSaved'),'success');
  });
  el.resetAccentBtn.addEventListener('click',()=>{
    const d='#ffffff';el.accentColorInput.value=d;el.accentColorHex.value=d;
    state.settings.accentColor=d;applyAccentColor(d,true);saveSettings();showToast(tr('accentReset'),'default');
  });
  document.querySelectorAll('.accent-preset').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const c=btn.dataset.color;el.accentColorInput.value=c;el.accentColorHex.value=c;
      state.settings.accentColor=c;applyAccentColor(c,true);saveSettings();
      document.querySelectorAll('.accent-preset').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  el.imageInput.addEventListener('change',()=>{Array.from(el.imageInput.files).forEach(addPendingImage);el.imageInput.value='';});
  el.wipeMemoryBtn.addEventListener('click',()=>{if(confirm(tr('wipeConfirm'))){localStorage.clear();location.reload();}});
  el.chatSearch.addEventListener('input',()=>{
    state.searchQuery=el.chatSearch.value.trim().toLowerCase();
    el.searchClear.style.display=state.searchQuery?'flex':'none';renderHistory();
  });
  el.searchClear.addEventListener('click',()=>{el.chatSearch.value='';state.searchQuery='';el.searchClear.style.display='none';renderHistory();});
  el.modalCancel.addEventListener('click',closeModal);
  el.chatModal.addEventListener('click',e=>{if(e.target===el.chatModal)closeModal();});
  el.modelTrigger.addEventListener('click',e=>{
    e.stopPropagation();
    const open=el.modelDropdownRoot.classList.toggle('open');
    if(open){
      el.modelSearchInput.value='';buildModelPanel('');
      const rect=el.modelTrigger.getBoundingClientRect();
      const panel=el.modelDropdownRoot.querySelector('.model-panel');
      if(panel){
        let left=rect.left+rect.width/2-115;
        if(left<8) left=8;
        if(left+230>window.innerWidth-8) left=window.innerWidth-238;
        panel.style.top=(rect.bottom+7)+'px';
        panel.style.left=left+'px';
      }
      setTimeout(()=>el.modelSearchInput.focus(),60);
    }
  });
  el.modelSearchInput.addEventListener('input',()=>buildModelPanel(el.modelSearchInput.value));
  document.addEventListener('click',e=>{
    if(!el.modelDropdownRoot.contains(e.target)) el.modelDropdownRoot.classList.remove('open');
    const active=document.querySelector('.ui-select-wrap.open');
    if(active&&!active.contains(e.target)) active.classList.remove('open');
  });
  document.addEventListener('keydown',e=>{
    const mod=e.metaKey||e.ctrlKey;
    if(mod&&e.key==='k'){e.preventDefault();el.chatSearch.focus();}
    if(mod&&e.key==='n'){e.preventDefault();createNewChat();}
    if(e.key==='Escape'){closeModal();el.modelDropdownRoot.classList.remove('open');closeAllPanels();}
  });
  el.exportChatBtn.addEventListener('click',exportChat);
  el.clearChatBtn.addEventListener('click',clearCurrentChat);
  bindSelectUI('responseStyleSelect',v=>{state.settings.responseStyle=v;saveSettings();});
  bindSelectUI('emojiLevelSelect',   v=>{state.settings.emojiLevel=v;saveSettings();});
  bindSelectUI('themeSelect',        v=>{applyTheme(v,true);saveSettings();});
  bindSelectUI('chatFontSelect',     v=>{applyChatFont(v);state.settings.chatFont=v;saveSettings();});
  bindSelectUI('fontSizeSelect',     v=>{applyFontSize(v);state.settings.fontSize=v;saveSettings();});
  bindSelectUI('effectSelect',       v=>{state.settings.textEffect=v;saveSettings();});
  bindSelectUI('languageSelect',     v=>{state.settings.language=v;saveSettings();showToast('Language saved — reload to apply fully.','success');});
}

function updateCharCounter(){
  const l=el.chatInput.value.length;
  el.charCounter.textContent=l>0?l:'';
  el.charCounter.style.opacity=l>0?'1':'0';
}

function exportChat(){
  const chat=state.chats.find(c=>c.id===state.currentId);
  if(!chat||chat.messages.length===0){showToast(tr('nothingExport'),'error');return;}
  const lines=[`# ${chat.title}\n\nModel: ${chat.model||state.currentModel}\nExported: ${new Date().toLocaleString()}\n\n---\n`];
  chat.messages.forEach(m=>{
    if(m.role==='user') lines.push(`**You:** ${m.content}\n`);
    else if(m.role==='assistant') lines.push(`**AI:** ${m.content}\n`);
  });
  const blob=new Blob([lines.join('\n')],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`${chat.title.replace(/[^a-z0-9]/gi,'_')}.md`;a.click();
  showToast(tr('exported'),'success');
}

function clearCurrentChat(){
  const chat=state.chats.find(c=>c.id===state.currentId);if(!chat)return;
  if(!confirm(tr('clearConfirm')))return;
  chat.messages=[];saveChats();renderMessages();renderHistory();showToast(tr('cleared'),'success');
}

function bindSelectUI(id,onChange){
  const wrap=q(id);if(!wrap)return;
  const trigger=wrap.querySelector('.ui-select-trigger');
  const panel=wrap.querySelector('.ui-select-panel');
  if(!trigger||!panel)return;
  trigger.addEventListener('click',e=>{
    e.stopPropagation();
    const wasOpen=wrap.classList.contains('open');closeAllPanels();
    if(!wasOpen)wrap.classList.add('open');
  });
  panel.querySelectorAll('.ui-select-option').forEach(opt=>{
    opt.addEventListener('click',()=>{
      panel.querySelectorAll('.ui-select-option').forEach(o=>o.classList.remove('active'));
      opt.classList.add('active');
      wrap.querySelector('.ui-select-value').textContent=opt.textContent;
      wrap.classList.remove('open');onChange(opt.dataset.value);
    });
  });
}

function syncSelectUI(id,value){
  const wrap=q(id);if(!wrap)return;
  wrap.querySelectorAll('.ui-select-option').forEach(o=>{
    const m=o.dataset.value===value;o.classList.toggle('active',m);
    if(m) wrap.querySelector('.ui-select-value').textContent=o.textContent;
  });
}

function syncToggle(btn,on){if(btn)btn.classList.toggle('on',!!on);}

function closeAllPanels(){
  document.querySelectorAll('.ui-select-wrap.open').forEach(w=>w.classList.remove('open'));
  el.modelDropdownRoot.classList.remove('open');
}

function buildModelPanel(query){
  const qStr=query.trim().toLowerCase();
  el.modelPanelList.innerHTML='';
  const filtered=qStr?ALL_MODELS.filter(m=>m.label.toLowerCase().includes(qStr)||m.id.toLowerCase().includes(qStr)):ALL_MODELS;
  const groups={};
  filtered.forEach(m=>{if(!groups[m.group])groups[m.group]=[];groups[m.group].push(m);});
  if(filtered.length===0){
    const e=document.createElement('div');e.className='model-empty';e.textContent=tr('noModels');
    el.modelPanelList.appendChild(e);return;
  }
  Object.entries(groups).forEach(([group,models])=>{
    const h=document.createElement('div');h.className='model-group-label';h.textContent=group;
    el.modelPanelList.appendChild(h);
    models.forEach(m=>{
      const item=document.createElement('button');
      item.className='model-item'+(m.id===state.currentModel?' active':'');
      item.innerHTML=`<span class="model-item-label">${m.label}</span>${m.badge?`<span class="model-item-badge">${m.badge}</span>`:''}`;
      item.addEventListener('click',()=>{
        state.currentModel=m.id;localStorage.setItem('mousy_model',m.id);setModelTriggerLabel(m.id);
        const chat=state.chats.find(c=>c.id===state.currentId);
        if(chat){chat.model=m.id;saveChats();}
        el.modelDropdownRoot.classList.remove('open');
        el.modelPanelList.querySelectorAll('.model-item').forEach(i=>i.classList.remove('active'));
        item.classList.add('active');
      });
      el.modelPanelList.appendChild(item);
    });
  });
}

function setModelTriggerLabel(modelId){
  const found=ALL_MODELS.find(m=>m.id===modelId);
  el.modelTriggerLabel.textContent=found?found.label:modelId;
}

function applyTheme(theme,animate){
  state.settings.theme=theme;
  let resolved=theme;
  if(theme==='auto'){
    const h=new Date().getHours();resolved=(h>=7&&h<20)?'light':'dark';
    if(state.autoThemeTimer)clearInterval(state.autoThemeTimer);
    state.autoThemeTimer=setInterval(()=>{
      const h2=new Date().getHours();
      document.documentElement.setAttribute('data-theme',(h2>=7&&h2<20)?'light':'dark');
    },60000);
  } else {
    if(state.autoThemeTimer){clearInterval(state.autoThemeTimer);state.autoThemeTimer=null;}
  }
  if(animate){document.body.classList.add('theme-transitioning');setTimeout(()=>document.body.classList.remove('theme-transitioning'),500);}
  document.documentElement.setAttribute('data-theme',resolved);
}

function applyFontSize(size){
  const map={sm:'0.82rem',md:'0.93rem',lg:'1.05rem',xl:'1.18rem'};
  const codeMap={sm:'0.78rem',md:'0.88rem',lg:'0.96rem',xl:'1.04rem'};
  document.documentElement.style.setProperty('--msg-font-size',map[size]||'0.93rem');
  document.documentElement.style.setProperty('--code-font-size',codeMap[size]||'0.88rem');
}
function applyChatFont(font){document.documentElement.style.setProperty('--chat-font',`'${font}',sans-serif`);}
function applyCompactMode(on){document.documentElement.classList.toggle('compact',!!on);}
function applyAccentColor(hex,animate){
  if(animate){document.body.classList.add('theme-transitioning');setTimeout(()=>document.body.classList.remove('theme-transitioning'),500);}
  document.documentElement.style.setProperty('--accent',hex);
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  document.documentElement.style.setProperty('--accent-inv',(0.299*r+0.587*g+0.114*b)/255>0.55?'#000000':'#ffffff');
}

function togglePwField(input,btn){
  const show=input.type==='password';input.type=show?'text':'password';
  btn.innerHTML=show?'<i data-lucide="eye-off"></i>':'<i data-lucide="eye"></i>';
  lucide.createIcons();
}
function addPendingImage(file){
  if(!file.type.startsWith('image/')){showToast(tr('imageOnly'),'error');return;}
  if(file.size>10*1024*1024){showToast(tr('imageSize'),'error');return;}
  const reader=new FileReader();
  reader.onload=e=>{
    const dataUrl=e.target.result,base64=dataUrl.split(',')[1],mimeType=file.type,id=Date.now()+Math.random();
    state.pendingImages.push({id,base64,mimeType,dataUrl,name:file.name});renderImagePreviews();
  };
  reader.readAsDataURL(file);
}
function renderImagePreviews(){
  el.imagePreviewBar.innerHTML='';
  if(!state.pendingImages.length){el.imagePreviewBar.classList.remove('has-images');el.attachBtn.classList.remove('has-files');return;}
  el.imagePreviewBar.classList.add('has-images');el.attachBtn.classList.add('has-files');
  state.pendingImages.forEach(img=>{
    const wrap=document.createElement('div');wrap.className='preview-thumb-wrap';
    wrap.innerHTML=`<img class="preview-thumb" src="${img.dataUrl}" alt="${esc(img.name)}"><button class="preview-remove" title="Remove">✕</button>`;
    wrap.querySelector('.preview-remove').addEventListener('click',()=>{state.pendingImages=state.pendingImages.filter(i=>i.id!==img.id);renderImagePreviews();});
    el.imagePreviewBar.appendChild(wrap);
  });
}
function toggleSidebar(){el.sidebar.classList.toggle('open');el.overlay.classList.toggle('active');}
function closeSidebarMobile(){if(window.innerWidth<=768){el.sidebar.classList.remove('open');el.overlay.classList.remove('active');}}
function switchView(view){
  const isSett=view==='settings';
  const from=isSett?el.chatView:el.settingsView,to=isSett?el.settingsView:el.chatView;
  from.classList.add('view-leave');
  setTimeout(()=>{
    from.classList.remove('active','view-leave');to.classList.add('active','view-enter');
    lucide.createIcons();setTimeout(()=>to.classList.remove('view-enter'),300);
  },200);
  closeSidebarMobile();
}
function saveGeminiKey(){
  const raw=el.geminiKeyInput.value.trim();
  if(!raw){showToast(tr('keyEmpty'),'error');return;}
  if(!raw.startsWith('AIza')){showToast(tr('geminiPrefix'),'error');return;}
  if(raw.length<30){showToast(tr('geminiShort'),'error');return;}
  if(/\s/.test(raw)){showToast(tr('keySpaces'),'error');return;}
  state.geminiKey=raw;localStorage.setItem('mousy_gemini_key',raw);showToast(tr('keySaved'),'success');
}
function saveOrKey(){
  const raw=el.orKeyInput.value.trim();
  if(!raw){showToast(tr('keyEmpty'),'error');return;}
  if(!raw.startsWith('sk-or-')){showToast(tr('orPrefix'),'error');return;}
  if(/\s/.test(raw)){showToast(tr('keySpaces'),'error');return;}
  state.openRouterKey=raw;localStorage.setItem('mousy_or_key',raw);showToast(tr('keySaved'),'success');
}
function saveSystemPrompt(){
  const val=el.systemPromptInput.value.trim();
  if(!val){showToast(tr('promptEmpty'),'error');return;}
  state.settings.systemPrompt=val;saveSettings();showToast(tr('promptSaved'),'success');
}
function createNewChat(){
  const id=Date.now().toString();
  state.chats.unshift({id,title:'New Chat',messages:[],model:state.currentModel});
  state.currentId=id;saveChats();renderHistory();renderMessages();closeSidebarMobile();
}
function switchChat(id){
  state.currentId=id;
  const chat=state.chats.find(c=>c.id===id);if(!chat)return;
  if(chat.model){state.currentModel=chat.model;setModelTriggerLabel(chat.model);}
  renderHistory();renderMessages();closeSidebarMobile();
}
function renderHistory(){
  el.historyList.innerHTML='';
  const qs=state.searchQuery;
  const list=qs?state.chats.filter(c=>c.title.toLowerCase().includes(qs)):state.chats;
  if(!list.length){
    const e=document.createElement('div');e.className='history-empty';
    e.textContent=qs?tr('noChatsFound'):tr('noChats');el.historyList.appendChild(e);return;
  }
  list.forEach((chat,i)=>{
    const wrap=document.createElement('div');
    wrap.className='history-item-wrap'+(chat.id===state.currentId?' active':'');
    wrap.style.animationDelay=`${i*0.022}s`;
    const btn=document.createElement('button');btn.className='history-item-btn';
    btn.innerHTML=`<i data-lucide="message-circle"></i><span>${esc(chat.title)}</span>`;
    btn.addEventListener('click',()=>switchChat(chat.id));
    const actions=document.createElement('div');actions.className='history-item-actions';
    const rb=document.createElement('button');rb.className='history-action-btn';rb.title='Rename';rb.innerHTML='<i data-lucide="pencil"></i>';
    rb.addEventListener('click',e=>{e.stopPropagation();showRenameModal(chat);});
    const db=document.createElement('button');db.className='history-action-btn history-action-delete';db.title='Delete';db.innerHTML='<i data-lucide="trash-2"></i>';
    db.addEventListener('click',e=>{e.stopPropagation();showDeleteModal(chat);});
    actions.appendChild(rb);actions.appendChild(db);
    wrap.appendChild(btn);wrap.appendChild(actions);el.historyList.appendChild(wrap);
  });
  lucide.createIcons();
}
function renderMessages(){
  el.chatContainer.innerHTML='';
  const chat=state.chats.find(c=>c.id===state.currentId);
  if(!chat||!chat.messages.length){
    const empty=document.createElement('div');empty.className='empty-state';
    empty.innerHTML=`<div class="empty-orb"><div class="orb-ring"></div><div class="orb-ring orb-ring-2"></div><div class="orb-core">✦</div></div><div class="empty-title">Mousy's AI</div><div class="empty-sub">${tr('startConvo')}</div>`;
    el.chatContainer.appendChild(empty);return;
  }
  chat.messages.forEach(msg=>appendMessage(msg.role,msg.content,msg.images||[],false,msg.ts));
  requestAnimationFrame(()=>highlightCode());
  scrollBottom();
}
function getEffectClass(){
  const map={
    'none':'msg-in','fade-in':'msg-fx-fade','slide-up':'msg-fx-slide-up',
    'scale-in':'msg-fx-scale','blur-in':'msg-fx-blur','glitch':'msg-fx-glitch',
    'bounce':'msg-fx-bounce','typewriter':'msg-fx-type','wipe':'msg-fx-wipe',
    'flip':'msg-fx-flip','rise':'msg-fx-rise',
  };
  return map[state.settings.textEffect]||'msg-fx-fade';
}
function appendMessage(role,content,images=[],animate=true,ts=null){
  const wrap=document.createElement('div');
  const fx=animate?(role==='user'?'msg-in-right':getEffectClass()):'';
  wrap.className='message-wrap'+(fx?' '+fx:'');
  const timeStr=(state.settings.showTimestamps&&ts)?`<span class="msg-time">${new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`:'';
  if(role==='user'){
    let imgHtml='';
    if(images&&images.length) imgHtml=`<div class="user-bubble-images">${images.map(img=>`<img class="user-bubble-img" src="data:${img.mimeType};base64,${img.base64}" alt="image">`).join('')}</div>`;
    wrap.innerHTML=imgHtml+(content?`<div class="user-bubble">${esc(content)}${timeStr}</div>`:'');
  } else if(role==='image'){
    const src=content.dataUrl||`data:${content.mimeType};base64,${content.data}`;
    wrap.innerHTML=`<div class="ai-label">Mousy's AI</div><div class="generated-image-wrap"><img class="generated-image" src="${src}" alt="generated"><a class="img-download-btn" href="${src}" download="generated.png">↓ Download</a></div>`;
  } else if(role==='error'){
    wrap.innerHTML=`<div class="error-bubble">${esc(content)}</div>`;
  } else {
    const rendered=state.settings.renderMarkdown!==false?parseMd(content):`<pre class="plain-text">${esc(content)}</pre>`;
    wrap.innerHTML=`<div class="ai-label">Mousy's AI</div><div class="message-content msg-text-inner">${rendered}${timeStr}</div>`;
    addMsgActions(wrap,content);
    if(animate&&fx==='msg-fx-type') typewriterEffect(wrap.querySelector('.msg-text-inner'),content,rendered);
  }
  el.chatContainer.appendChild(wrap);
  return wrap;
}
function typewriterEffect(container,rawText,finalHTML){
  if(!container) return;
  container.innerHTML='';
  let i=0;
  function tick(){
    if(i>rawText.length){container.innerHTML=finalHTML;highlightCode();return;}
    container.innerHTML='<p>'+esc(rawText.slice(0,i))+'▌</p>';
    i++;
    setTimeout(tick,12);
  }
  tick();
}
function addMsgActions(wrap,rawContent){
  const bar=document.createElement('div');bar.className='msg-actions';
  const copyBtn=document.createElement('button');copyBtn.className='msg-action-btn';copyBtn.title='Copy';
  copyBtn.innerHTML='<i data-lucide="copy"></i>';
  copyBtn.addEventListener('click',()=>{
    navigator.clipboard.writeText(rawContent).then(()=>{
      copyBtn.innerHTML='<i data-lucide="check"></i>';lucide.createIcons();
      setTimeout(()=>{copyBtn.innerHTML='<i data-lucide="copy"></i>';lucide.createIcons();},1800);
    });
  });
  bar.appendChild(copyBtn);lucide.createIcons(bar);wrap.appendChild(bar);
}
function showTyping(){
  const wrap=document.createElement('div');wrap.className='message-wrap msg-in';wrap.id='typingWrap';
  wrap.innerHTML=`<div class="ai-label">Mousy's AI</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  el.chatContainer.appendChild(wrap);scrollBottom();return wrap;
}
function hideTyping(){const tw=q('typingWrap');if(tw)tw.remove();}
function setRetryNotice(wrap,msg){let n=wrap.querySelector('.retry-notice');if(!n){n=document.createElement('div');n.className='retry-notice';wrap.appendChild(n);}n.textContent=msg;}
function buildGeminiContents(messages){
  return messages.filter(m=>m.role!=='image').map(msg=>{
    const role=msg.role==='assistant'?'model':'user';
    const parts=[];
    if(msg.images&&msg.images.length) msg.images.forEach(img=>parts.push({inlineData:{mimeType:img.mimeType,data:img.base64}}));
    if(msg.content) parts.push({text:msg.content});
    return{role,parts};
  });
}
async function callGemini(messages,model,typingWrap){
  const MAX_RETRIES=3;let attempt=0,delay=5;
  const contents=buildGeminiContents(messages);
  const body={contents,systemInstruction:{parts:[{text:buildSystemPrompt()}]},generationConfig:{}};
  if(GEMINI25_THINKING.has(model)) body.generationConfig.thinkingConfig={thinkingBudget:-1};
  while(true){
    const res=await fetch(`${GEMINI_BASE}/${model}:generateContent`,{
      method:'POST',
      headers:{'x-goog-api-key':state.geminiKey,'Content-Type':'application/json'},
      body:JSON.stringify(body),
    });
    if(res.status===429){
      attempt++;
      const d=await res.json().catch(()=>({}));
      if(d?.error?.status==='RESOURCE_EXHAUSTED'&&d?.error?.message?.toLowerCase().includes('quota'))
        throw{message:'Your Gemini quota ran out. Check usage at aistudio.google.com.'};
      if(attempt>MAX_RETRIES) throw{message:`Still rate limited after ${MAX_RETRIES} retries. Try again shortly.`};
      setRetryNotice(typingWrap,`Gemini is busy — retrying in ${delay}s (${attempt}/${MAX_RETRIES})…`);
      await sleep(delay*1000);delay=Math.min(delay*2,30);continue;
    }
    const data=await res.json();
    if(!res.ok){
      const s=res.status;let msg=data?.error?.message||'Something went wrong.';
      if(s===400) msg=msg.toLowerCase().includes('api key')?"Your Gemini key doesn't look valid. Check Settings.":`Gemini couldn't process that. ${msg}`;
      else if(s===401||s===403) msg="Your Gemini key doesn't look valid. Check Settings.";
      else if(s===404) msg=`Model "${model}" not found.`;
      else if(s>=500) msg='Gemini is having trouble. Try again shortly.';
      throw{message:msg};
    }
    const candidate=data?.candidates?.[0];
    if(!candidate){
      const reason=data?.promptFeedback?.blockReason;
      throw{message:reason?`Gemini blocked that prompt (${reason}). Try rephrasing.`:'Got an empty response. Try again.'};
    }
    const text=candidate.content?.parts?.filter(p=>p.text)?.map(p=>p.text)?.join('')||'';
    if(!text) throw{message:'Got an empty text response. Try again.'};
    return text;
  }
}
async function callOpenRouter(messages,model){
  const sys=buildSystemPrompt();
  const msgs=[];
  if(sys) msgs.push({role:'system',content:sys});
  for(const m of messages){
    if(m.role==='user'){
      if(m.images&&m.images.length){
        const parts=[];
        if(m.content) parts.push({type:'text',text:m.content});
        for(const img of m.images) parts.push({type:'image_url',image_url:{url:`data:${img.mimeType};base64,${img.base64}`}});
        msgs.push({role:'user',content:parts});
      } else {
        msgs.push({role:'user',content:m.content||''});
      }
    } else if(m.role==='assistant'){
      msgs.push({role:'assistant',content:m.content||''});
    }
  }
  const res=await fetch(OR_BASE,{
    method:'POST',
    headers:{'Authorization':`Bearer ${state.openRouterKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model,messages:msgs}),
  });
  const data=await res.json();
  if(!res.ok) throw{message:data?.error?.message||`OpenRouter error ${res.status}`};
  return data.choices?.[0]?.message?.content||'';
}
async function callOpenRouterImage(prompt,model){
  const res=await fetch(OR_BASE,{
    method:'POST',
    headers:{'Authorization':`Bearer ${state.openRouterKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model,messages:[{role:'user',content:prompt}],modalities:['image']}),
  });
  const data=await res.json();
  if(!res.ok) throw{message:data?.error?.message||'Image generation failed.'};
  const msg=data.choices?.[0]?.message;
  const images=msg?.images||[];
  if(!images.length) throw{message:'No image returned. Try a different prompt.'};
  const url=images[0].image_url?.url;
  if(!url) throw{message:'Invalid image response from OpenRouter.'};
  return{dataUrl:url};
}
async function sendMessage(){
  if(state.sending) return;
  const text=el.chatInput.value.trim();
  const images=[...state.pendingImages];
  const model=state.currentModel;
  if(!text&&!images.length){showToast(tr('typeFirst'),'error');return;}
  const isGemini=GEMINI_MODELS.has(model);
  const isOrImg=OR_IMAGE_MODELS.has(model);
  const isOrChat=OR_CHAT_MODELS.has(model);
  if(isGemini&&!state.geminiKey){showToast(tr('needGemini'),'error');return;}
  if((isOrImg||isOrChat)&&!state.openRouterKey){showToast(tr('needOr'),'error');return;}
  const chat=state.chats.find(c=>c.id===state.currentId);if(!chat)return;
  chat.model=model;
  if(!chat.messages.length) chat.title=text?(text.length>30?text.substring(0,30)+'…':text):'Image';
  const ts=Date.now();
  const userMsg={role:'user',content:text,images:images.map(img=>({base64:img.base64,mimeType:img.mimeType})),ts};
  chat.messages.push(userMsg);
  el.chatInput.value='';el.chatInput.style.height='auto';
  state.pendingImages=[];renderImagePreviews();updateCharCounter();
  const existingEmpty=el.chatContainer.querySelector('.empty-state');if(existingEmpty)existingEmpty.remove();
  appendMessage('user',text,userMsg.images,true,ts);
  const typingWrap=showTyping();
  state.sending=true;el.sendBtn.disabled=true;
  try{
    if(isOrImg){
      const result=await callOpenRouterImage(text,model);hideTyping();
      const imgMsg={role:'image',content:{dataUrl:result.dataUrl},ts:Date.now()};
      chat.messages.push(imgMsg);appendMessage('image',imgMsg.content,[],true,imgMsg.ts);
    } else if(isOrChat){
      const aiText=await callOpenRouter(chat.messages,model);hideTyping();
      const aiTs=Date.now();
      chat.messages.push({role:'assistant',content:aiText,images:[],ts:aiTs});
      appendMessage('assistant',aiText,[],true,aiTs);
      requestAnimationFrame(()=>highlightCode());
    } else {
      const aiText=await callGemini(chat.messages,model,typingWrap);hideTyping();
      const aiTs=Date.now();
      chat.messages.push({role:'assistant',content:aiText,images:[],ts:aiTs});
      appendMessage('assistant',aiText,[],true,aiTs);
      requestAnimationFrame(()=>highlightCode());
    }
    saveChats();renderHistory();scrollBottom();
  } catch(err){
    hideTyping();chat.messages.pop();
    appendMessage('error',err.message||'Something went wrong, please try again.',[],true);
    saveChats();
  } finally{
    state.sending=false;el.sendBtn.disabled=false;
  }
}
function highlightCode(){
  if(typeof Prism==='undefined') return;
  document.querySelectorAll('pre code[class*="language-"]').forEach(block=>{try{Prism.highlightElement(block);}catch(e){}});
}
function parseMd(raw){
  const lines=raw.split('\n');
  const segments=[];
  let inCode=false,codeLang='',codeLines=[],textLines=[];
  const flushText=()=>{if(textLines.length){segments.push({type:'text',content:textLines.join('\n')});textLines=[];}};
  for(const line of lines){
    const fenceOpen=!inCode&&/^```(\w*)$/.exec(line);
    const fenceClose=inCode&&line.trim()==='```';
    if(fenceOpen){flushText();inCode=true;codeLang=fenceOpen[1]||'text';codeLines=[];}
    else if(fenceClose){
      const l=codeLang||'text';
      const safe=codeLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      segments.push({type:'code',lang:l,content:safe});
      inCode=false;codeLang='';codeLines=[];
    } else if(inCode){codeLines.push(line);}
    else{textLines.push(line);}
  }
  if(inCode&&codeLines.length){
    const l=codeLang||'text';
    const safe=codeLines.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    segments.push({type:'code',lang:l,content:safe});
  }
  flushText();
  return segments.map(seg=>{
    if(seg.type==='code')
      return `<div class="code-block"><div class="code-header"><span class="code-lang">${seg.lang.toUpperCase()}</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div><pre><code class="language-${seg.lang}">${seg.content}</code></pre></div>`;
    let t=seg.content;
    t=t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    t=t.replace(/\*(.*?)\*/g,'<em>$1</em>');
    t=t.replace(/`([^`\n]+)`/g,'<code class="inline-code">$1</code>');
    t=t.replace(/^### (.+)$/gm,'<h3>$1</h3>');
    t=t.replace(/^## (.+)$/gm,'<h2>$1</h2>');
    t=t.replace(/^# (.+)$/gm,'<h1>$1</h1>');
    const subLines=t.split('\n'),processed=[],listBuf=[],olistBuf=[];
    const flushLists=()=>{
      if(listBuf.length) processed.push('<ul>'+listBuf.splice(0).join('')+'</ul>');
      if(olistBuf.length) processed.push('<ol>'+olistBuf.splice(0).join('')+'</ol>');
    };
    for(const sl of subLines){
      const ulM=sl.match(/^[-*] (.+)$/),olM=sl.match(/^\d+\. (.+)$/);
      if(ulM){if(olistBuf.length)processed.push('<ol>'+olistBuf.splice(0).join('')+'</ol>');listBuf.push(`<li>${ulM[1]}</li>`);}
      else if(olM){if(listBuf.length)processed.push('<ul>'+listBuf.splice(0).join('')+'</ul>');olistBuf.push(`<li>${olM[1]}</li>`);}
      else{flushLists();processed.push(sl);}
    }
    flushLists();
    let joined=processed.join('\n');
    joined=joined.replace(/\n{3,}/g,'\n\n').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
    return `<p>${joined}</p>`;
  }).join('');
}
function esc(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function copyCode(btn){
  const code=btn.closest('.code-block').querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(()=>{
    btn.textContent='Copied';btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);
  });
}
function showRenameModal(chat){
  el.modalTitle.textContent='Rename Chat';el.modalInput.style.display='block';el.modalInput.value=chat.title;
  el.chatModal.classList.add('active');setTimeout(()=>el.modalInput.focus(),80);
  el.modalConfirm.onclick=()=>{
    const t=el.modalInput.value.trim();if(!t){showToast(tr('renameEmpty'),'error');return;}
    chat.title=t;saveChats();renderHistory();closeModal();showToast(tr('chatRenamed'),'success');
  };
  el.modalInput.onkeydown=e=>{if(e.key==='Enter')el.modalConfirm.click();};
}
function showDeleteModal(chat){
  el.modalTitle.textContent=`Delete "${chat.title}"?`;el.modalInput.style.display='none';
  el.chatModal.classList.add('active');
  el.modalConfirm.onclick=()=>{
    state.chats=state.chats.filter(c=>c.id!==chat.id);saveChats();
    if(state.currentId===chat.id){if(state.chats.length)switchChat(state.chats[0].id);else createNewChat();}
    else renderHistory();
    closeModal();showToast(tr('chatDeleted'),'success');
  };
}
function closeModal(){el.chatModal.classList.remove('active');el.modalConfirm.onclick=null;el.modalInput.onkeydown=null;}
function scrollBottom(){requestAnimationFrame(()=>el.chatContainer.scrollTo({top:el.chatContainer.scrollHeight,behavior:'smooth'}));}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function showToast(msg,type='default'){
  const t=document.createElement('div');t.className=`toast toast-${type}`;t.textContent=msg;
  el.toastContainer.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-out');setTimeout(()=>t.remove(),220);},2800);
}
function saveChats(){localStorage.setItem('mousy_chats',JSON.stringify(state.chats));}
function saveSettings(){localStorage.setItem('mousy_settings',JSON.stringify(state.settings));}

init();
