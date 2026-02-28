-- ================================================================================
-- AI学习伙伴 - SQLite 数据库架构
-- ================================================================================
-- 创建日期：2024
-- 数据库类型：SQLite 3
-- 字符集：UTF-8
-- ================================================================================

-- ================================================================================
-- 一、用户系统相关表
-- ================================================================================

-- 1. 用户表 (users)
-- 用途：存储用户基本信息和认证数据
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,              -- 用户名（唯一）
    password_hash TEXT NOT NULL,                -- 密码哈希值
    email TEXT UNIQUE,                          -- 邮箱（唯一）
    nickname TEXT NOT NULL,                     -- 昵称
    avatar TEXT,                                -- 头像URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,                       -- 最后登录时间
    status TEXT DEFAULT 'active'                -- 账号状态：active/inactive/banned
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ================================================================================
-- 二、课程管理相关表
-- ================================================================================

-- 2. 课程库表 (courses)
-- 用途：存储所有可用课程信息（公共课程库）
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL,                  -- 课程名称
    course_code TEXT,                           -- 课程代码
    teacher TEXT,                               -- 教师姓名
    description TEXT,                           -- 课程描述
    credits REAL,                               -- 学分
    day_of_week TEXT NOT NULL DEFAULT '待定',  -- 星期几
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(course_name);


-- 3. 用户课程表 (user_courses)
-- 用途：存储用户的个人课表
CREATE TABLE IF NOT EXISTS user_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,                  -- 课程名称
    teacher TEXT,                               -- 教师
    description TEXT,                           -- 课程描述
    day_of_week TEXT NOT NULL DEFAULT '待定',  -- 星期几（1-7或周一-周日）
    start_time TEXT NOT NULL,                   -- 开始时间（如 08:00）
    end_time TEXT NOT NULL,                     -- 结束时间（如 09:40）
    location TEXT NOT NULL,                     -- 上课地点
    classroom TEXT NOT NULL,                    -- 教室
    start_week INTEGER NOT NULL,                -- 开始周次
    end_week INTEGER NOT NULL,                  -- 结束周次
    color TEXT DEFAULT '#4a90e2',               -- 课程颜色标记
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, day_of_week, start_time, end_time)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_courses_user ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_day ON user_courses(day_of_week);


-- ================================================================================
-- 三、学习数据相关表
-- ================================================================================

-- 4. 科目成绩表 (scores)
-- 用途：记录用户各科目的成绩数据
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,                      -- 科目名称
    score REAL NOT NULL,                        -- 成绩分数
    full_score REAL DEFAULT 100,                -- 满分
    exam_type TEXT,                             -- 考试类型：期中/期末/平时
    exam_date DATE,                             -- 考试日期
    notes TEXT,                                 -- 备注
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_subject ON scores(subject);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(exam_date);


-- 5. 专注时长表 (focus_sessions)
-- 用途：记录用户使用专注模式的时长
CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT,                               -- 学习科目
    duration INTEGER NOT NULL,                  -- 专注时长（分钟）
    start_time TIMESTAMP,                       -- 开始时间
    end_time TIMESTAMP,                         -- 结束时间
    completed BOOLEAN DEFAULT 1,                -- 是否完成（1完成/0中断）
    notes TEXT,                                 -- 备注
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_date ON focus_sessions(created_at);


-- ================================================================================
-- 四、目标管理相关表
-- ================================================================================

-- 6. 学习目标表 (goals)
-- 用途：存储用户的学习目标
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 目标标题
    description TEXT,                           -- 目标描述
    category TEXT,                              -- 目标分类：学习/成长/其他
    target_value REAL,                          -- 目标值（如分数、时长）
    current_value REAL DEFAULT 0,               -- 当前值
    unit TEXT,                                  -- 单位（分/小时/次）
    target_date DATE,                           -- 目标完成日期
    priority TEXT DEFAULT 'medium',             -- 优先级：high/medium/low
    status TEXT DEFAULT 'pending',              -- 状态：pending/in_progress/completed/cancelled
    completed_at TIMESTAMP,                     -- 完成时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_date ON goals(target_date);


-- ================================================================================
-- 五、AI 交互相关表
-- ================================================================================

-- 7. AI 对话记录表 (chat_history)
-- 用途：存储用户与 AI 的对话历史
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT,                            -- 会话ID（同一次对话）
    role TEXT NOT NULL,                         -- 角色：user/assistant/system
    message TEXT NOT NULL,                      -- 消息内容
    message_type TEXT DEFAULT 'text',           -- 消息类型：text/image/file
    tokens_used INTEGER,                        -- 使用的token数
    model TEXT,                                 -- 使用的AI模型
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_date ON chat_history(created_at);


-- 8. AI 分析结果表 (ai_analysis)
-- 用途：存储 AI 对用户学习数据的分析结果
CREATE TABLE IF NOT EXISTS ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    analysis_type TEXT NOT NULL,                -- 分析类型：score/focus/overall
    analysis_data TEXT NOT NULL,                -- 分析数据（JSON格式）
    suggestions TEXT,                           -- AI建议
    weak_points TEXT,                           -- 薄弱知识点
    strong_points TEXT,                         -- 优势知识点
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_analysis_user ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON ai_analysis(analysis_type);


-- ================================================================================
-- 六、个人成长相关表
-- ================================================================================

-- 9. 成长记录表 (growth_records)
-- 用途：记录用户的个人成长和心得体会
CREATE TABLE IF NOT EXISTS growth_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 记录标题
    content TEXT NOT NULL,                      -- 记录内容
    tags TEXT,                                  -- 标签（逗号分隔）
    mood TEXT,                                  -- 心情：happy/normal/sad
    images TEXT,                                -- 图片URL（逗号分隔）
    is_public BOOLEAN DEFAULT 0,                -- 是否公开
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_growth_user ON growth_records(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_date ON growth_records(created_at);


-- ================================================================================
-- 七、资源管理相关表
-- ================================================================================

-- 10. 用户收藏表 (user_bookmarks)
-- 用途：存储用户收藏的文档、网页等资源
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 收藏标题
    url TEXT,                                   -- 资源URL
    content TEXT,                               -- 内容摘要
    category TEXT,                              -- 分类：文档/网页/视频/其他
    tags TEXT,                                  -- 标签（逗号分隔）
    folder TEXT DEFAULT '默认',                -- 文件夹
    is_favorite BOOLEAN DEFAULT 0,              -- 是否星标
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON user_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder ON user_bookmarks(folder);


-- 11. 笔记表 (notes)
-- 用途：存储用户的 Markdown 笔记
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 笔记标题
    content TEXT NOT NULL,                      -- 笔记内容（Markdown格式）
    category TEXT,                              -- 分类
    tags TEXT,                                  -- 标签（逗号分隔）
    is_favorite BOOLEAN DEFAULT 0,              -- 是否星标
    is_archived BOOLEAN DEFAULT 0,              -- 是否归档
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);


-- ================================================================================
-- 八、提醒和通知相关表
-- ================================================================================

-- 12. 提醒表 (reminders)
-- 用途：存储用户设置的提醒事项
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 提醒标题
    content TEXT,                               -- 提醒内容
    remind_time TIMESTAMP NOT NULL,             -- 提醒时间
    repeat_type TEXT DEFAULT 'once',            -- 重复类型：once/daily/weekly/monthly
    repeat_days TEXT,                           -- 重复日期（如：1,3,5表示周一三五）
    is_completed BOOLEAN DEFAULT 0,             -- 是否完成
    is_active BOOLEAN DEFAULT 1,                -- 是否激活
    priority TEXT DEFAULT 'normal',             -- 优先级：high/normal/low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(remind_time);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);


-- 13. 通知表 (notifications)
-- 用途：存储系统通知和消息
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,                        -- 通知标题
    content TEXT NOT NULL,                      -- 通知内容
    type TEXT NOT NULL,                         -- 类型：reminder/system/achievement
    is_read BOOLEAN DEFAULT 0,                  -- 是否已读
    action_url TEXT,                            -- 点击跳转URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at);


-- ================================================================================
-- 九、AI 出题相关表
-- ================================================================================

-- 14. 题目库表 (questions)
-- 用途：存储 AI 生成的题目
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,                            -- 用户ID（NULL表示公共题库）
    subject TEXT NOT NULL,                      -- 科目
    question_type TEXT NOT NULL,                -- 题型：选择/填空/简答/判断
    difficulty TEXT NOT NULL,                   -- 难度：easy/medium/hard
    question_text TEXT NOT NULL,                -- 题目内容
    options TEXT,                               -- 选项（JSON格式）
    correct_answer TEXT NOT NULL,               -- 正确答案
    explanation TEXT,                           -- 答案解析
    knowledge_points TEXT,                      -- 知识点（逗号分隔）
    source TEXT DEFAULT 'ai_generated',         -- 来源：ai_generated/manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);


-- 15. 答题记录表 (answer_records)
-- 用途：记录用户的答题情况
CREATE TABLE IF NOT EXISTS answer_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    user_answer TEXT NOT NULL,                  -- 用户答案
    is_correct BOOLEAN NOT NULL,                -- 是否正确
    time_spent INTEGER,                         -- 答题用时（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_answers_user ON answer_records(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answer_records(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_correct ON answer_records(is_correct);


-- 16. 错题本表 (wrong_questions)
-- 用途：收藏用户的错题
CREATE TABLE IF NOT EXISTS wrong_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    review_count INTEGER DEFAULT 0,             -- 复习次数
    mastered BOOLEAN DEFAULT 0,                 -- 是否已掌握
    last_review_at TIMESTAMP,                   -- 最后复习时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    UNIQUE(user_id, question_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_mastered ON wrong_questions(mastered);


-- ================================================================================
-- 十、信息推荐相关表
-- ================================================================================

-- 17. 资讯表 (information)
-- 用途：存储推荐的资讯和资源
CREATE TABLE IF NOT EXISTS information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                        -- 资讯标题
    content TEXT NOT NULL,                      -- 资讯内容
    summary TEXT,                               -- 摘要
    category TEXT NOT NULL,                     -- 分类：学习资料/考试信息/活动通知
    tags TEXT,                                  -- 标签（逗号分隔）
    source TEXT,                                -- 来源
    url TEXT,                                   -- 原文链接
    image_url TEXT,                             -- 封面图片
    location TEXT,                              -- 地理位置（用于定位推荐）
    view_count INTEGER DEFAULT 0,               -- 浏览次数
    is_published BOOLEAN DEFAULT 1,             -- 是否发布
    published_at TIMESTAMP,                     -- 发布时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_info_category ON information(category);
CREATE INDEX IF NOT EXISTS idx_info_published ON information(is_published);
CREATE INDEX IF NOT EXISTS idx_info_date ON information(published_at);


-- 18. 用户浏览记录表 (user_views)
-- 用途：记录用户浏览资讯的历史
CREATE TABLE IF NOT EXISTS user_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    information_id INTEGER NOT NULL,
    view_duration INTEGER,                      -- 浏览时长（秒）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (information_id) REFERENCES information (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_views_user ON user_views(user_id);
CREATE INDEX IF NOT EXISTS idx_views_info ON user_views(information_id);


-- ================================================================================
-- 十一、用户偏好和设置表
-- ================================================================================

-- 19. 用户设置表 (user_settings)
-- 用途：存储用户的个性化设置
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    theme TEXT DEFAULT 'light',                 -- 主题：light/dark/auto
    language TEXT DEFAULT 'zh-CN',              -- 语言
    notification_enabled BOOLEAN DEFAULT 1,     -- 是否启用通知
    email_notification BOOLEAN DEFAULT 1,       -- 邮件通知
    study_reminder BOOLEAN DEFAULT 1,           -- 学习提醒
    daily_goal_minutes INTEGER DEFAULT 120,     -- 每日学习目标（分钟）
    focus_duration INTEGER DEFAULT 25,          -- 番茄钟时长（分钟）
    break_duration INTEGER DEFAULT 5,           -- 休息时长（分钟）
    white_noise TEXT DEFAULT 'none',            -- 白噪音类型
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_settings_user ON user_settings(user_id);


-- ================================================================================
-- 十二、统计和报告相关表
-- ================================================================================

-- 20. 学习统计表 (study_statistics)
-- 用途：存储用户的学习统计数据（按天汇总）
CREATE TABLE IF NOT EXISTS study_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stat_date DATE NOT NULL,                    -- 统计日期
    total_study_time INTEGER DEFAULT 0,         -- 总学习时长（分钟）
    focus_sessions INTEGER DEFAULT 0,           -- 专注次数
    completed_tasks INTEGER DEFAULT 0,          -- 完成任务数
    questions_answered INTEGER DEFAULT 0,       -- 答题数量
    correct_rate REAL,                          -- 正确率
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, stat_date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_stats_user ON study_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_date ON study_statistics(stat_date);


-- ================================================================================
-- 创建触发器：自动更新 updated_at 字段
-- ================================================================================

-- users 表触发器
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- goals 表触发器
CREATE TRIGGER IF NOT EXISTS update_goals_timestamp 
AFTER UPDATE ON goals
BEGIN
    UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- growth_records 表触发器
CREATE TRIGGER IF NOT EXISTS update_growth_timestamp 
AFTER UPDATE ON growth_records
BEGIN
    UPDATE growth_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- user_bookmarks 表触发器
CREATE TRIGGER IF NOT EXISTS update_bookmarks_timestamp 
AFTER UPDATE ON user_bookmarks
BEGIN
    UPDATE user_bookmarks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- notes 表触发器
CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
AFTER UPDATE ON notes
BEGIN
    UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- user_settings 表触发器
CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
AFTER UPDATE ON user_settings
BEGIN
    UPDATE user_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;


-- ================================================================================
-- 数据库架构创建完成
-- ================================================================================
-- 总计：20 个数据表
-- 包含：用户系统、课程管理、学习数据、目标管理、AI交互、
--       个人成长、资源管理、提醒通知、AI出题、信息推荐、
--       用户设置、统计报告
-- ================================================================================
