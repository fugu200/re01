// 导入 API 工具
import { apiGet, apiPost } from './api.js';

// 全局变量
let currentEditCourseId = null;
let scheduleData = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initScheduleEvents();
  // 【必填函数】页面加载自动调用，加载课表数据
  loadSchedule();
});

// ========================================
// 【必填函数1】加载课表数据
// 严格调用学长要求的API：apiGet('/api/schedule/list')
// ========================================
function loadSchedule() {
  // 调用后端接口获取课表列表
  apiGet('/api/schedule/list')
    .then(res => {
      if (res.code === 200) {
        scheduleData = res.data || [];
        // 渲染课表到页面
        renderSchedule();
      }
    })
    .catch(err => {
      console.error('加载课表失败，请确保后端接口已启动', err);
    });
}

// ========================================
// 【必填函数2】添加课程
// ========================================
function addCourse(courseData) {
  // 调用后端新增接口
  return apiPost('/api/schedule/add', courseData)
    .then(res => {
      if (res.code === 200) {
        alert('添加成功');
        // 重新加载课表
        loadSchedule();
        return true;
      }
    })
    .catch(err => {
      console.error('添加课程失败', err);
      alert('添加失败，请确保后端接口已启动');
      return false;
    });
}

// ========================================
// 【必填函数3】编辑课程
// ========================================
function editCourse(courseId, courseData) {
  // 调用后端编辑接口
  return apiPost(`/api/schedule/edit/${courseId}`, courseData)
    .then(res => {
      if (res.code === 200) {
        alert('修改成功');
        loadSchedule();
        return true;
      }
    })
    .catch(err => {
      console.error('编辑课程失败', err);
      alert('修改失败，请确保后端接口已启动');
      return false;
    });
}

// ========================================
// 【必填函数4】删除课程
// ========================================
function deleteCourse(courseId) {
  // 调用后端删除接口
  return apiGet(`/api/schedule/delete/${courseId}`)
    .then(res => {
      if (res.code === 200) {
        alert('删除成功');
        loadSchedule();
        return true;
      }
    })
    .catch(err => {
      console.error('删除课程失败', err);
      alert('删除失败，请确保后端接口已启动');
      return false;
    });
}

// ========================================
// 【必填函数5】导入课表（Excel/图片OCR）
// ========================================
function importSchedule(file, type) {
  // 新建FormData上传文件
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  // 调用后端导入接口
  return apiPost('/api/schedule/import', formData)
    .then(res => {
      if (res.code === 200) {
        alert('导入成功');
        loadSchedule();
        return true;
      }
    })
    .catch(err => {
      console.error('导入失败', err);
      alert('导入功能开发中，可先使用添加课程功能');
      return false;
    });
}

// ========================================
// 辅助渲染&事件函数（不影响必填规范）
// ========================================

// 渲染课表到页面
function renderSchedule() {
  // 清空所有单元格
  document.querySelectorAll('.schedule-cell').forEach(cell => {
    cell.innerHTML = '';
  });

  // 遍历课表数据，生成课程卡片
  scheduleData.forEach(course => {
    for (let section = course.startSection; section <= course.endSection; section++) {
      const cell = document.querySelector(
        `.schedule-cell[data-week="${course.week}"][data-section="${section}"]`
      );
      if (!cell) continue;

      // 仅在起始节渲染完整课程卡片
      if (section === course.startSection) {
        const rowSpan = course.endSection - course.startSection + 1;
        cell.innerHTML = `
          <div class="course-card" data-course-id="${course.id}" style="height: ${rowSpan * 80 - 8}px">
            <div class="course-name">${course.courseName}</div>
            ${course.location ? `<div class="course-info">📍 ${course.location}</div>` : ''}
            ${course.teacher ? `<div class="course-info">👨‍🏫 ${course.teacher}</div>` : ''}
          </div>
        `;

        // 点击课程卡片打开编辑弹窗
        cell.querySelector('.course-card').addEventListener('click', function(e) {
          e.stopPropagation();
          openEditCourseForm(Number(this.getAttribute('data-course-id')));
        });
      }
    }
  });
}

// 初始化所有事件
function initScheduleEvents() {
  // 添加课程按钮
  document.getElementById('addCourseBtn').addEventListener('click', openAddCourseForm);

  // 导入课表按钮
  document.getElementById('importScheduleBtn').addEventListener('click', openImportModal);

  // 课程表单事件
  document.getElementById('closeFormBtn').addEventListener('click', closeCourseForm);
  document.getElementById('cancelFormBtn').addEventListener('click', closeCourseForm);
  document.getElementById('deleteCourseBtn').addEventListener('click', handleDeleteCourse);
  document.getElementById('courseForm').addEventListener('submit', handleFormSubmit);

  // 导入弹窗事件
  document.getElementById('closeImportBtn').addEventListener('click', closeImportModal);
  document.getElementById('cancelImportBtn').addEventListener('click', closeImportModal);
  document.getElementById('confirmImportBtn').addEventListener('click', handleImportConfirm);
}

// 打开添加课程表单
function openAddCourseForm() {
  currentEditCourseId = null;
  document.getElementById('formTitle').innerText = '添加课程';
  document.getElementById('courseForm').reset();
  document.getElementById('deleteCourseBtn').style.display = 'none';
  document.getElementById('courseFormModal').classList.add('show');
}

// 打开编辑课程表单
function openEditCourseForm(courseId) {
  const course = scheduleData.find(item => item.id === courseId);
  if (!course) return;

  currentEditCourseId = courseId;
  document.getElementById('formTitle').innerText = '编辑课程';

  // 给表单赋值
  document.querySelector('input[name="courseName"]').value = course.courseName;
  document.querySelector('select[name="week"]').value = course.week;
  document.querySelector('input[name="startSection"]').value = course.startSection;
  document.querySelector('input[name="endSection"]').value = course.endSection;
  document.querySelector('input[name="location"]').value = course.location || '';
  document.querySelector('input[name="teacher"]').value = course.teacher || '';

  // 显示删除按钮
  document.getElementById('deleteCourseBtn').style.display = 'block';

  // 打开弹窗
  document.getElementById('courseFormModal').classList.add('show');
}

// 关闭课程表单
function closeCourseForm() {
  document.getElementById('courseFormModal').classList.remove('show');
  currentEditCourseId = null;
}

// 表单提交处理
function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const courseData = {
    courseName: formData.get('courseName'),
    week: Number(formData.get('week')),
    startSection: Number(formData.get('startSection')),
    endSection: Number(formData.get('endSection')),
    location: formData.get('location'),
    teacher: formData.get('teacher')
  };

  // 节数校验
  if (courseData.endSection < courseData.startSection) {
    alert('结束节数不能小于开始节数');
    return;
  }

  // 判断添加/编辑
  if (currentEditCourseId) {
    editCourse(currentEditCourseId, courseData).then(() => {
      closeCourseForm();
    });
  } else {
    addCourse(courseData).then(() => {
      closeCourseForm();
    });
  }
}

// 删除课程处理
function handleDeleteCourse() {
  if (!currentEditCourseId) return;
  if (!confirm('确定要删除这门课程吗？')) return;

  deleteCourse(currentEditCourseId).then(() => {
    closeCourseForm();
  });
}

// 导入弹窗相关
function openImportModal() {
  document.getElementById('importScheduleModal').classList.add('show');
}

function closeImportModal() {
  document.getElementById('importScheduleModal').classList.remove('show');
  document.getElementById('excelFileInput').value = '';
  document.getElementById('imageFileInput').value = '';
}

function handleImportConfirm() {
  const excelFile = document.getElementById('excelFileInput').files[0];
  const imageFile = document.getElementById('imageFileInput').files[0];

  if (excelFile) {
    importSchedule(excelFile, 'excel').then(() => {
      closeImportModal();
    });
  } else if (imageFile) {
    importSchedule(imageFile, 'image').then(() => {
      closeImportModal();
    });
  } else {
    alert('请选择要导入的文件');
  }
}
