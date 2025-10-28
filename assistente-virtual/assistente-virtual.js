// assistente-virtual.js - Componente Web Reutilizável
class AssistenteVirtual extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.history = [];
    this.STORAGE_KEY = 'assistente_virtual_history';
  }

  connectedCallback() {
    this.render();
    this.init();
  }

  static get observedAttributes() {
    return ['api-url', 'title', 'subtitle'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.init();
    }
  }

  render() {
    const title = this.getAttribute('title') || 'ASSISTENTE VIRTUAL';
    const subtitle = this.getAttribute('subtitle') || 'Experiência de Conversação Premium • IA Avançada';
    
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      <div class="assistente-container">
        <div class="particles" id="particles"></div>
        <div class="grid-overlay"></div>

        <div class="ai-chat-container">
          <div class="ai-header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
          </div>

          <div class="chat-interface">
            <div class="messages-container" id="messagesContainer"></div>
            
            <div class="input-area">
              <div class="input-container">
                <div class="textarea-container">
                  <textarea 
                    class="chat-textarea" 
                    id="prompt" 
                    placeholder="Digite sua mensagem para o assistente..."
                    rows="1"
                  ></textarea>
                </div>
                <button class="send-button" id="sendBtn" title="Enviar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              <div class="controls">
                <button class="control-button" id="btnCopyLast">📋 Copiar última</button>
                <button class="control-button" id="btnClearHistory">🗑️ Limpar chat</button>
                <button class="control-button" id="btnPreview">🐛 Modo Debug</button>
              </div>

              <div class="debug-section" id="debugWrap">
                <div class="debug-title">Resposta Bruta (Debug):</div>
                <pre class="debug-box" id="rawBox"></pre>
              </div>
              
              <div class="model-info" id="metaModel"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }

      :root {
        --bg: #000000;
        --card: #0a0a0a;
        --primary: #00ffff;
        --primary-dark: #0099cc;
        --secondary: #ff00ff;
        --accent: #00ff88;
        --muted: #666666;
        --text: #ffffff;
        --border: rgba(255,255,255,0.1);
        --error: #ff3366;
        --success: #00ff9d;
        --glow: 0 0 20px rgba(0, 255, 255, 0.3);
      }

      .assistente-container {
        background-color: var(--bg);
        color: var(--text);
        min-height: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        position: relative;
        border-radius: 1rem;
        border: 1px solid var(--border);
      }

      .particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        overflow: hidden;
        border-radius: 1rem;
      }

      .particle {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
        opacity: 0.1;
        animation: float 20s infinite linear;
        filter: blur(1px);
      }

      @keyframes float {
        0% { transform: translateY(0) translateX(0) rotate(0deg); }
        25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
        50% { transform: translateY(-10px) translateX(20px) rotate(180deg); }
        75% { transform: translateY(10px) translateX(10px) rotate(270deg); }
        100% { transform: translateY(0) translateX(0) rotate(360deg); }
      }

      .grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        z-index: 1;
        pointer-events: none;
        opacity: 0.3;
        border-radius: 1rem;
      }

      .ai-chat-container {
        width: 100%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        position: relative;
        z-index: 2;
      }

      .ai-header {
        text-align: center;
        position: relative;
        padding: 1rem 0;
      }

      .ai-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 150px;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--primary), transparent);
        box-shadow: var(--glow);
      }

      .ai-header h1 {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 300;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        letter-spacing: 1px;
      }

      .ai-header p {
        font-size: clamp(0.8rem, 2vw, 1rem);
        color: var(--muted);
        font-weight: 300;
      }

      .chat-interface {
        width: 100%;
        background: linear-gradient(145deg, #0a0a0a, #000000);
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 
          0 0 30px rgba(0, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        height: 500px;
        position: relative;
      }

      .chat-interface::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--primary), transparent);
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: rgba(0, 0, 0, 0.7);
      }

      .message {
        display: flex;
        gap: 0.8rem;
        max-width: 100%;
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { 
          opacity: 0; 
          transform: translateY(10px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      .message.user {
        justify-content: flex-end;
      }

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.7rem;
        flex-shrink: 0;
        border: 2px solid transparent;
      }

      .message.user .message-avatar {
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: #000;
        border-color: var(--primary);
      }

      .message.ai .message-avatar {
        background: linear-gradient(135deg, var(--secondary), #cc00ff);
        color: white;
        border-color: var(--secondary);
      }

      .message-content {
        max-width: 70%;
        padding: 0.8rem 1rem;
        border-radius: 1rem;
        font-size: 0.9rem;
        line-height: 1.4;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
      }

      .message.user .message-content {
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 153, 204, 0.1));
        color: var(--text);
        border: 1px solid rgba(0, 255, 255, 0.3);
      }

      .message.ai .message-content {
        background: linear-gradient(135deg, rgba(255, 0, 255, 0.15), rgba(204, 0, 255, 0.1));
        color: var(--text);
        border: 1px solid rgba(255, 0, 255, 0.3);
      }

      .input-area {
        border-top: 1px solid rgba(0, 255, 255, 0.2);
        padding: 1rem;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }

      .input-container {
        display: flex;
        align-items: flex-end;
        gap: 0.8rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.8rem;
        padding: 0.8rem;
        border: 1px solid rgba(0, 255, 255, 0.2);
      }

      .textarea-container {
        flex: 1;
        position: relative;
      }

      .chat-textarea {
        width: 100%;
        min-height: 40px;
        max-height: 120px;
        padding: 0.6rem;
        background: transparent;
        border: none;
        resize: none;
        color: var(--text);
        font-size: 0.9rem;
        line-height: 1.4;
        outline: none;
        font-family: inherit;
      }

      .chat-textarea::placeholder {
        color: var(--muted);
      }

      .send-button {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: linear-gradient(135deg, var(--primary), var(--primary-dark));
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
      }

      .send-button:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      }

      .send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: scale(0.95);
      }

      .controls {
        display: flex;
        gap: 0.6rem;
        margin-top: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .control-button {
        padding: 0.5rem 1rem;
        border-radius: 0.6rem;
        border: 1px solid rgba(0, 255, 255, 0.3);
        background: rgba(0, 255, 255, 0.1);
        color: var(--text);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.8rem;
        backdrop-filter: blur(10px);
      }

      .control-button:hover {
        background: rgba(0, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        color: var(--muted);
        font-size: 0.8rem;
        margin-top: 0.3rem;
      }

      .typing-dots {
        display: flex;
        gap: 0.2rem;
      }

      .typing-dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        animation: typing 1.4s infinite ease-in-out;
      }

      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
        30% { transform: translateY(-4px); opacity: 1; }
      }

      .model-info {
        text-align: center;
        font-size: 0.8rem;
        color: var(--muted);
        margin-top: 0.8rem;
      }

      .debug-section {
        margin-top: 1rem;
        display: none;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 0.6rem;
        padding: 1rem;
        border: 1px solid rgba(255, 0, 255, 0.2);
      }

      .debug-title {
        color: var(--muted);
        font-size: 0.8rem;
        margin-bottom: 0.6rem;
      }

      .debug-box {
        background: rgba(0, 0, 0, 0.9);
        border-radius: 0.4rem;
        padding: 0.8rem;
        max-height: 150px;
        overflow: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.7rem;
        color: var(--primary);
        border: 1px solid rgba(0, 255, 255, 0.1);
      }

      ::-webkit-scrollbar { 
        width: 4px; 
      }
      ::-webkit-scrollbar-track { 
        background: rgba(0, 255, 255, 0.05); 
      }
      ::-webkit-scrollbar-thumb { 
        background: linear-gradient(var(--primary), var(--secondary)); 
        border-radius: 2px; 
      }

      @media (max-width: 768px) {
        .assistente-container { 
          padding: 0.5rem; 
          min-height: 500px;
        }
        .ai-chat-container { 
          gap: 1rem; 
        }
        .ai-header { 
          padding: 0.5rem 0; 
        }
        .chat-interface { 
          height: 400px; 
          border-radius: 0.8rem;
        }
        .messages-container { 
          padding: 1rem; 
          gap: 0.8rem; 
        }
        .message-content { 
          max-width: 85%; 
          font-size: 0.8rem; 
          padding: 0.6rem 0.8rem;
        }
        .message-avatar {
          width: 28px;
          height: 28px;
          font-size: 0.6rem;
        }
        .input-area { 
          padding: 0.8rem; 
        }
        .input-container { 
          padding: 0.6rem; 
        }
        .send-button {
          width: 36px;
          height: 36px;
        }
        .control-button {
          padding: 0.4rem 0.8rem;
          font-size: 0.7rem;
        }
      }

      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.2); }
        50% { box-shadow: 0 0 25px rgba(0, 255, 255, 0.4); }
      }

      .chat-interface {
        animation: pulse-glow 3s ease-in-out infinite;
      }
    `;
  }

  init() {
    this.createParticles();
    this.setupEventListeners();
    this.loadHistory();
  }

  createParticles() {
    const particlesContainer = this.shadowRoot.getElementById('particles');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 60 + 20;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = 10 + Math.random() * 10;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      const colors = ['#00ffff', '#ff00ff', '#00ff88'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = `radial-gradient(circle, ${randomColor} 0%, transparent 70%)`;
      
      particlesContainer.appendChild(particle);
    }
  }

  setupEventListeners() {
    const sendBtn = this.shadowRoot.getElementById('sendBtn');
    const promptEl = this.shadowRoot.getElementById('prompt');
    const btnCopyLast = this.shadowRoot.getElementById('btnCopyLast');
    const btnClearHistory = this.shadowRoot.getElementById('btnClearHistory');
    const btnPreview = this.shadowRoot.getElementById('btnPreview');

    sendBtn.addEventListener('click', () => this.handleSendMessage());
    
    promptEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    promptEl.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    btnCopyLast.addEventListener('click', () => this.copyLastMessage());
    btnClearHistory.addEventListener('click', () => this.clearHistory());
    btnPreview.addEventListener('click', () => this.toggleDebug());
  }

  handleSendMessage() {
    const promptEl = this.shadowRoot.getElementById('prompt');
    const text = promptEl.value.trim();
    
    if (!text) { 
      this.showNotification('Digite uma mensagem!', 'error');
      return; 
    }
    
    this.callApi(text);
    promptEl.value = '';
    promptEl.style.height = 'auto';
  }

  showNotification(message, type = 'info') {
    // Implementação simples de notificação
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  loadHistory() { 
    try { 
      this.history = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      this.renderHistory();
    } catch(e){ 
      this.history = []; 
    } 
  }

  renderHistory() {
    const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    if (this.history.length > 0) {
      this.history.forEach(item => {
        if (item.prompt) this.addMessage(item.prompt, true, 'Você');
        if (item.content) this.addMessage(item.content, false, item.name);
      });
    } else {
      // Mensagem de boas-vindas
      setTimeout(() => {
        this.addMessage('Olá! Sou seu assistente virtual. Como posso ajudar você hoje?', false, 'IA');
      }, 500);
    }
  }

  saveHistory() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
  }

  addMessage(content, isUser = false, name = 'IA') {
    const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = isUser ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typingIndicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
      <div class="typing-indicator">
        Digitando
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
    const el = messagesContainer.querySelector('#typingIndicator');
    if (el) el.remove();
  }

  async callApi(prompt) {
    const sendBtn = this.shadowRoot.getElementById('sendBtn');
    const rawBox = this.shadowRoot.getElementById('rawBox');
    const debugWrap = this.shadowRoot.getElementById('debugWrap');
    const metaModel = this.shadowRoot.getElementById('metaModel');

    sendBtn.disabled = true;
    this.addMessage(prompt, true, 'Você');
    this.showTypingIndicator();

    try {
      const API_URL = this.getAttribute('api-url') || 
                     (window.location.hostname === 'localhost' 
                      ? 'http://localhost:3000/api/chat'
                      : '/api/chat');

      const messageHistory = [];
      const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
      const allMessages = messagesContainer.querySelectorAll('.message');
      
      allMessages.forEach(messageEl => {
        const isUser = messageEl.classList.contains('user');
        const content = messageEl.querySelector('.message-content').textContent;
        
        if (content && !content.includes('Digitando')) {
          messageHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content
          });
        }
      });

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt,
          messageHistory: messageHistory.slice(-10) // Últimas 10 mensagens
        })
      });

      const data = await res.json();
      this.hideTypingIndicator();
      sendBtn.disabled = false;

      if (!res.ok) {
        let errorMsg = data.error || 'Erro na API';
        this.addMessage(`❌ Erro: ${errorMsg}`, false, 'Sistema');
        rawBox.textContent = JSON.stringify(data, null, 2);
        debugWrap.style.display = 'block';
        return;
      }

      const name = data.name || 'IA';
      const content = data.content || data.response || 'Sem resposta da IA';
      const raw = data.raw || data;

      metaModel.textContent = raw?.model ? `Modelo: ${raw.model}` : 'Assistente Virtual';

      this.addMessage(content, false, name);

      rawBox.textContent = JSON.stringify(raw, null, 2);

      this.history.push({ 
        time: Date.now(), 
        name, 
        prompt, 
        content: content 
      });
      
      if (this.history.length > 50) this.history.splice(0, this.history.length - 50);
      this.saveHistory();

    } catch (err) {
      this.hideTypingIndicator();
      sendBtn.disabled = false;
      this.addMessage(`🌐 Erro de conexão: ${err.message}`, false, 'Sistema');
      console.error('Erro:', err);
    }
  }

  copyLastMessage() {
    const messagesContainer = this.shadowRoot.getElementById('messagesContainer');
    const messages = messagesContainer.querySelectorAll('.message-content');
    
    if (messages.length < 1) {
      this.showNotification('Nada para copiar', 'warning');
      return;
    }
    
    const lastMessage = messages[messages.length - 1].textContent;
    navigator.clipboard.writeText(lastMessage).then(() => {
      const btnCopyLast = this.shadowRoot.getElementById('btnCopyLast');
      const originalText = btnCopyLast.textContent;
      btnCopyLast.textContent = '✓ Copiado!';
      setTimeout(() => {
        btnCopyLast.textContent = originalText;
      }, 2000);
    }).catch(() => {
      this.showNotification('Erro ao copiar', 'error');
    });
  }

  clearHistory() {
    if (!confirm('Limpar todo o histórico do chat?')) return;
    localStorage.removeItem(this.STORAGE_KEY);
    this.history = [];
    this.renderHistory();
    this.showNotification('Histórico limpo', 'success');
  }

  toggleDebug() {
    const debugWrap = this.shadowRoot.getElementById('debugWrap');
    const btnPreview = this.shadowRoot.getElementById('btnPreview');
    const isVisible = debugWrap.style.display === 'block';
    
    debugWrap.style.display = isVisible ? 'none' : 'block';
    btnPreview.textContent = isVisible ? '🐛 Modo Debug' : '👁️ Ocultar Debug';
  }
}

// Registra o custom element
if (!customElements.get('assistente-virtual')) {
  customElements.define('assistente-virtual', AssistenteVirtual);
}
