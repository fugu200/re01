/**
 * 用户认证管理模块
 * 提供登录、注册、登出、认证状态管理等功能
 */

// ==================== API 配置 ====================
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:5000',
  timeout: 30000,
};

function getApiBaseUrl() {
  return localStorage.getItem('api_base_url') || API_CONFIG.baseUrl;
}

function setApiBaseUrl(url) {
  localStorage.setItem('api_base_url', url);
}

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

function isAuthenticated() {
  return !!getAuthToken();
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('current_user') || '{}');
}

function setCurrentUser(user) {
  localStorage.setItem('current_user', JSON.stringify(user));
}

// ==================== 工具函数库 ====================
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// ==================== Toast 通知组件 ====================
let toastContainer = null;

function initToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

function showToast(message, type = 'info', duration = 3000) {
  const container = initToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
  `;
  
  const colors = {
    success: { bg: '#10b981', light: '#d1fae5', icon: '#10b981' },
    error: { bg: '#ef4444', light: '#fee2e2', icon: '#ef4444' },
    warning: { bg: '#f59e0b', light: '#fef3c7', icon: '#f59e0b' },
    info: { bg: '#3b82f6', light: '#dbeafe', icon: '#3b82f6' }
  };
  
  const color = colors[type] || colors.info;
  
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: white;
    border: 1px solid ${color.light};
    border-left: 4px solid ${color.bg};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 300px;
    max-width: 500px;
    pointer-events: auto;
    animation: slideIn 0.3s ease;
    color: #1f2937;
    font-size: 14px;
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration)
};

// ==================== HTTP 客户端 ====================
async function request(url, options = {}) {
  const fullUrl = `${getApiBaseUrl()}${url}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // 添加认证头
  if (isAuthenticated()) {
    config.headers['Authorization'] = `Bearer ${getAuthToken()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  config.signal = controller.signal;

  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}

// ==================== 认证服务 ====================
class AuthService {
  /**
   * 用户登录
   * @param {string} username - 用户名或邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 返回用户信息和token
   */
  static async login(username, password) {
    // 前端基本验证
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }

    if (password.length < 6) {
      throw new Error('密码长度不能少于6位');
    }

    // 如果是邮箱格式，进行邮箱验证
    if (isValidEmail(username) && !isValidEmail(username)) {
      throw new Error('邮箱格式不正确');
    }

    try {
      // 发送登录请求到后端
      const response = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      // 成功后保存认证信息
      setAuthToken(response.token);
      setCurrentUser({
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        createdAt: response.user.createdAt
      });

      return response;
    } catch (error) {
      // 登录失败时清除可能存在的旧token
      clearAuthToken();
      throw error;
    }
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @param {string} [userData.phone] - 手机号 (可选)
   * @returns {Promise<Object>} - 返回注册结果
   */
  static async register(userData) {
    const { username, email, password, phone } = userData;

    // 前端验证
    if (!username || !email || !password) {
      throw new Error('用户名、邮箱和密码不能为空');
    }

    if (!isValidEmail(email)) {
      throw new Error('邮箱格式不正确');
    }

    if (phone && !isValidPhone(phone)) {
      throw new Error('手机号格式不正确');
    }

    if (password.length < 6) {
      throw new Error('密码长度不能少于6位');
    }

    if (username.length < 2 || username.length > 20) {
      throw new Error('用户名长度应在2-20个字符之间');
    }

    try {
      // 发送注册请求到后端
      const response = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 用户登出
   */
  static logout() {
    clearAuthToken();
    localStorage.removeItem('current_user');
    // 如果后端有登出接口，可以调用它来使服务器端的token失效
    // await request('/api/auth/logout', { method: 'POST' });
  }

  /**
   * 获取当前登录用户信息
   * @returns {Object|null} - 当前用户信息
   */
  static getCurrentUser() {
    return getCurrentUser();
  }

  /**
   * 检查用户是否已认证
   * @returns {boolean}
   */
  static isAuthenticated() {
    return isAuthenticated();
  }

  /**
   * 更新用户信息
   * @param {Object} profileData - 用户资料更新数据
   * @returns {Promise<Object>}
   */
  static async updateProfile(profileData) {
    if (!isAuthenticated()) {
      throw new Error('未登录');
    }

    try {
      const response = await request('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      // 更新本地存储的用户信息
      const currentUser = getCurrentUser();
      setCurrentUser({ ...currentUser, ...profileData });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 修改密码
   * @param {Object} passwordData - 密码修改数据
   * @param {string} passwordData.currentPassword - 当前密码
   * @param {string} passwordData.newPassword - 新密码
   * @returns {Promise<Object>}
   */
  static async changePassword(passwordData) {
    if (!isAuthenticated()) {
      throw new Error('未登录');
    }

    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw new Error('当前密码和新密码不能为空');
    }

    if (newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }

    try {
      const response = await request('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData)
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 刷新认证令牌
   * @returns {Promise<string>} - 新的token
   */
  static async refreshToken() {
    const refreshToken = localStorage.getIt