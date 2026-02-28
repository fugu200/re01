// 导入必要的API函数
import { apiPost } from '../assets/js/api.js';
import { toast } from '../assets/js/toast.js';

// AI对话功能
function sendMessage() {
  const message = document.getElementById('user-message').value;
  if (!message) return;
  
  // 渲染消息
  renderMessage(message, 'user');
  
  // 发送消息到后端
  apiPost('/api/ai/chat', { message })
    .then(response => {
      renderMessage(response.reply, 'ai');
    })
    .catch(error => {
      toast.error('发送失败');
    });
}

function renderMessage(content, sender) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${sender}`;
  messageElement.innerHTML = `<div class="message-content">${content}</div>`;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 学习辅导功能
function submitQuestion() {
  const subject = document.getElementById('subject-select').value;
  const question = document.getElementById('question-input').value;
  
  if (!subject || !question) {
    toast.warning('请选择学科并输入问题');
    return;
  }
  
  apiPost('/api/ai/tutor', { subject, question })
    .then(response => {
      displayAnswer(response.answer);
      recommendKnowledge(response.recommended);
    })
    .catch(error => {
      toast.error('获取辅导失败');
    });
}

function displayAnswer(answer) {
  document.getElementById('tutor-answer').innerHTML = `<div class="answer-content">${answer}</div>`;
}

function recommendKnowledge(knowledge) {
  const knowledgeContainer = document.getElementById('knowledge-recommend');
  knowledgeContainer.innerHTML = `<div class="recommend-title">相关知识点：</div>`;
  
  knowledge.forEach(k => {
    const knowledgeElement = document.createElement('div');
    knowledgeElement.className = 'knowledge-item';
    knowledgeElement.textContent = k;
    knowledgeContainer.appendChild(knowledgeElement);
  });

}
// 添加事件绑定（关键！）
document.addEventListener('DOMContentLoaded', function() {
  // 绑定发送按钮
  document.getElementById('send-button').addEventListener('click', sendMessage);
  
  // 绑定回车键发送
  document.getElementById('user-message').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
});
