// ==================== API 请求封装 ====================
import { getApiBaseUrl, getAuthToken } from './config.js';
import { toast } from './toast.js';
import { showLoading, hideLoading } from './loading.js';

/**
 * 统一的 API 请求函数
 * @param {string} path - API 路径（如 '/api/user'）
 * @param {object} options - fetch 选项
 * @returns {Promise<any>} - 返回响应数据
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  
  // 默认配置
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // 添加认证 token
  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // 是否显示加载状态
  const showLoadingState = options.showLoading !== false;
  const showErrorToast = options.showError !== false;

  try {
    if (showLoadingState) {
      showLoading(options.loadingText || '请求中...');
    }

    const response = await fetch(url, config);
    
    // 处理 HTTP 错误
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `请求失败 (${response.status})` 
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // 返回 JSON 数据
    const data = await response.json();
    
    // 显示成功提示（如果配置了）
    if (options.successMessage) {
      toast.success(options.successMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    
    // 显示错误提示
    if (showErrorToast) {
      toast.error(error.message || '请求失败，请稍后重试');
    }
    
    throw error;
  } finally {
    if (showLoadingState) {
      hideLoading();
    }
  }
}

// ==================== 常用 API 方法 ====================

// GET 请求
export function apiGet(path) {
  return apiFetch(path, { method: 'GET' });
}

// POST 请求
export function apiPost(path, data) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT 请求
export function apiPut(path, data) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE 请求
export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}
