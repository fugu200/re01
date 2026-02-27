// ==================== API 配置 ====================
const API_CONFIG = {
  // 默认后端地址（可在设置页面修改）
  baseUrl: 'http://127.0.0.1:5000',
  timeout: 30000,
};

// 获取 API 基础地址
export function getApiBaseUrl() {
  return localStorage.getItem('api_base_url') || API_CONFIG.baseUrl;
}

// 设置 API 基础地址
export function setApiBaseUrl(url) {
  localStorage.setItem('api_base_url', url);
}

// 获取认证 token
export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// 设置认证 token
export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

// 清除认证 token
export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

// 检查是否已登录
export function isAuthenticated() {
  return !!getAuthToken();
}
