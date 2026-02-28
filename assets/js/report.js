function generateWeeklyReport() {
  apiGet('/api/report/weekly?date=' + new Date().toISOString().split('T')[0])
    .then(response => {
      displayReport(response);
      renderChart(response.chartData);
    });
}

function generateMonthlyReport() {
  apiGet('/api/report/monthly?date=' + new Date().toISOString().split('T')[0])
    .then(response => {
      displayReport(response);
      renderChart(response.chartData);
    });
}

function displayReport(report) {
  const statsContainer = document.getElementById('report-stats');
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${report.totalStudyTime}</div>
      <div class="stat-label">学习时长</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.completedTasks}</div>
      <div class="stat-label">完成任务</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.studyEfficiency}%</div>
      <div class="stat-label">学习效率</div>
    </div>
  `;
}

function renderChart(data) {
  // 使用Chart.js渲染图表
  const ctx = document.getElementById('report-chart').getContext('2d');
  // 创建图表实例
  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}