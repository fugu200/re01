// assets/js/chat.js

// 1. 导入必要的模块
import { apiPost } from './api.js';
import { toast } from './toast.js';

console.log('[CHAT] Initializing chat module...');

// 2. DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('[CHAT] DOM fully loaded, initializing chat interface');
  
  // 检查关键元素是否存在
  const sendButton = document.getElementById('send-button');
  const messageInput = document.getElementById('user-message');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!sendButton) {
    console.error('[CHAT] Send button not found (ID: send-button)');
    toast.error('聊天功能初始化失败：发送按钮未找到');
    return;
  }
  
  if (!messageInput) {
    console.error('[CHAT] Message input not found (ID: user-message)');
    toast.error('聊天功能初始化失败：输入框未找到');
    return;
  }
  
  if (!chatMessages) {
    console.error('[CHAT] Messages container not found (ID: chat-messages)');
    toast.error('聊天功能初始化失败：消息容器未找到');
    return;
  }

  // 3. 绑定事件
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  console.log('[CHAT] Event listeners attached successfully');
  toast.success('聊天功能已就绪');
});

// 4. 发送消息函数
function sendMessage() {
  const message = document.getElementById('user-message').value.trim();
  
  if (!message) {
    toast.warning('请输入消息内容');
    console.warn('[CHAT] Empty message ignored');
    return;
  }

  console.log('[CHAT] Sending message:', message);
  
  // 清空输入框
  document.getElementById('user-message').value = '';
  
  // 渲染用户消息
  renderMessage(message, 'user');
  
  // 发送API请求
  apiPost('/api/ai/chat', { message })
    .then(response => {
      console.log('[CHAT] AI response received:', response);
      renderMessage(response.reply, 'ai');
    })
    .catch(error => {
      console.error('[CHAT] API error:', error);
      toast.error('发送失败: ' + (error.message || '服务器错误'));
    });
}

// 5. 渲染消息到聊天界面
function renderMessage(content, sender) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}`;
  
  // 确保内容安全（防止XSS）
  const safeContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  msgDiv.innerHTML = `<div class="message-content">${safeContent}</div>`;
  
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  
  console.log(`[CHAT] Message rendered (${sender}): ${content.substring(0, 50)}...`);
}

// 6. 学习辅导功能（保持完整）
document.getElementById('submit-question').addEventListener('click', submitQuestion);

function submitQuestion() {
  const subject = document.getElementById('subject-select').value;
  const question = document.getElementById('question-input').value;
  
  if (!subject || !question) {
    toast.warning('请选择学科并输入问题');
    console.warn('[CHAT] Missing subject or question');
    return;
  }

  console.log('[CHAT] Submitting tutor question:', { subject, question });
  
  apiPost('/api/ai/tutor', { subject, question })
    .then(res => {
      document.getElementById('tutor-answer').innerHTML = 
        `<div class="answer">${res.answer}</div>`;
      console.log('[CHAT] Tutor answer received');
    })
    .catch(error => {
      console.error('[CHAT] Tutor API error:', error);
      toast.error('辅导请求失败: ' + error.message);
    });
}

