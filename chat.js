const chatEl = document.getElementById('chat');
const input  = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let messages = [];
let isLoading = false;

function addMessage(role, text) {
  messages.push({ role, content: text });

  const wrap = document.createElement('div');
  wrap.className = `message ${role === 'user' ? 'user' : 'bot'}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'You' : 'AX';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'message bot';
  wrap.id = 'typing';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = 'AX';

  const ind = document.createElement('div');
  ind.className = 'typing-indicator';
  ind.innerHTML = '<span></span><span></span><span></span>';

  wrap.appendChild(avatar);
  wrap.appendChild(ind);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

function showQuickReplies(replies) {
  const div = document.createElement('div');
  div.className = 'quick-replies';
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'qr-btn';
    btn.textContent = r;
    btn.onclick = () => { div.remove(); sendMessage(r); };
    div.appendChild(btn);
  });
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage(text) {
  if (!text.trim() || isLoading) return;
  isLoading = true;
  sendBtn.disabled = true;

  document.querySelectorAll('.quick-replies').forEach(el => el.remove());

  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';

  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    });

    const data = await res.json();
    hideTyping();

    const reply = data.reply || "Sorry, I couldn't get a response right now.";
    addMessage('assistant', reply);

    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('how much')) {
      showQuickReplies(['Tell me more about your services', 'How do I get started?', 'Contact you']);
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      showQuickReplies(['What services do you offer?', 'How does pricing work?', 'I want a website']);
    } else if (lower.includes('service') || lower.includes('what do you')) {
      showQuickReplies(['How does pricing work?', 'I want a website', 'Contact you']);
    }

  } catch (err) {
    hideTyping();
    console.error('Chat error:', err);
    addMessage('assistant', 'Oops! Something went wrong. Please try again or call us at 76766199.');
  }

  isLoading = false;
  sendBtn.disabled = false;
  input.focus();
}

sendBtn.addEventListener('click', () => sendMessage(input.value));

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

window.addEventListener('load', () => {
  setTimeout(() => {
    addMessage('assistant', "Hi there! 👋 Welcome to Apex Web Development. I'm your AI assistant — I can tell you all about our web design services, how our pricing works, or help you get started on your project. What can I help you with today?");
    showQuickReplies(['What services do you offer?', 'How does pricing work?', 'I want a website built']);
  }, 400);
});
