// ==================== 全局加载状态管理 ====================

let loadingOverlay = null;
let loadingCount = 0;

/**
 * 创建加载遮罩层
 */
function createLoadingOverlay() {
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'global-loading';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    `;
    
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
      z-index: 9998;
      backdrop-filter: blur(4px);
    `;
    
    // 添加样式
    if (!document.getElementById('loading-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-styles';
      style.textContent = `
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-text {
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingOverlay);
  }
  return loadingOverlay;
}

/**
 * 显示全局加载状态
 * @param {string} text - 加载文本
 */
export function showLoading(text = '加载中...') {
  const overlay = createLoadingOverlay();
  loadingCount++;
  
  const textElement = overlay.querySelector('.loading-text');
  if (textElement) {
    textElement.textContent = text;
  }
  
  overlay.style.display = 'flex';
}

/**
 * 隐藏全局加载状态
 */
export function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  
  if (loadingCount === 0 && loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

/**
 * 异步函数包装器，自动显示/隐藏加载状态
 * @param {Function} asyncFunc - 异步函数
 * @param {string} loadingText - 加载文本
 * @returns {Function} 包装后的函数
 */
export function withLoading(asyncFunc, loadingText = '加载中...') {
  return async function(...args) {
    showLoading(loadingText);
    try {
      return await asyncFunc(...args);
    } finally {
      hideLoading();
    }
  };
}
