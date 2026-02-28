function saveGrowthRecord() {
  const date = document.getElementById('growth-date').value;
  const content = document.getElementById('growth-content').value;
  const reflection = document.getElementById('growth-reflection').value;
  
  if (!date || !content) {
    toast.warning('请填写日期和成长内容');
    return;
  }
  
  apiPost('/api/growth/save', { date, content, reflection })
    .then(response => {
      loadGrowthList();
      toast.success('成长记录保存成功');
    })
    .catch(error => {
      toast.error('保存失败');
    });
}

function loadGrowthList() {
  apiGet('/api/growth/list')
    .then(response => {
      const growthList = document.getElementById('growth-list');
      growthList.innerHTML = '';
      
      response.forEach(record => {
        const growthItem = document.createElement('div');
        growthItem.className = 'growth-item';
        growthItem.innerHTML = `
          <div class="growth-date">${record.date}</div>
          <div class="growth-content">${record.content}</div>
          <div class="growth-reflection">${record.reflection}</div>
          <div class="growth-actions">
            <button class="edit-btn">编辑</button>
            <button class="delete-btn">删除</button>
          </div>
        `;
        growthList.appendChild(growthItem);
      });
    });
}

// 目标管理功能
function addGoal() {
  // 添加目标的逻辑
}

function loadGoals() {
  // 加载目标列表的逻辑
}