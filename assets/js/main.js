// ==================== 路由配置 ====================
const ROUTES = {
  home: { title: '主页', url: './pages/home.html' },
  tools: { title: '工具中心', url: './pages/tools.html' },
  data: { title: '数据中心', url: './pages/data.html' },
  settings: { title: '设置', url: './pages/settings.html' },
  schedule: { title: '课表管理', url: './pages/tools/schedule.html' }
};

// ==================== DOM 元素 ====================
const contentFrame = document.getElementById('content-frame');
const pageTitle = document.getElementById('page-title');
const loading = document.getElementById('loading');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('theme-toggle');

// ==================== 页面导航 ====================
function navigateToPage(pageKey) {
  const route = ROUTES[pageKey];
  if (!route) {
    console.error(`路由 "${pageKey}" 不存在`);
    return;
  }

  // 显示加载动画
  loading.removeAttribute('hidden');

  // 更新标题
  pageTitle.textContent = route.title;

  // 更新导航高亮
  navItems.forEach(item => {
    if (item.dataset.page === pageKey) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 加载页面
  contentFrame.src = route.url;

  // 更新 URL hash
  window.location.hash = pageKey;
}

// 暴露给子页面使用
window.navigateToPage = navigateToPage;

// ==================== 事件监听 ====================
// 导航点击
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    navigateToPage(page);
  });
});

// iframe 加载完成
contentFrame.addEventListener('load', () => {
  loading.setAttribute('hidden', '');
});

// 主题切换
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // 同步到 iframe
  try {
    const iframeDoc = contentFrame.contentDocument || contentFrame.contentWindow.document;
    iframeDoc.documentElement.setAttribute('data-theme', newTheme);
  } catch (e) {
    console.warn('无法同步主题到 iframe:', e);
  }
}

themeToggle.addEventListener('click', toggleTheme);

// ==================== 初始化 ====================
function init() {
  // 恢复主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 根据 hash 加载页面
  const hash = window.location.hash.slice(1);
  const initialPage = ROUTES[hash] ? hash : 'home';
  navigateToPage(initialPage);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 监听 hash 变化
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (ROUTES[hash]) {
    navigateToPage(hash);
  }
});
