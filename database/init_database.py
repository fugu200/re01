#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI学习伙伴 - 数据库初始化脚本
用途：创建 SQLite 数据库并初始化表结构
"""

import sqlite3
import os
from datetime import datetime

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), 'learning_assistant.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


def init_database():
    """初始化数据库"""
    print("=" * 80)
    print("AI学习伙伴 - 数据库初始化")
    print("=" * 80)
    
    # 检查数据库是否已存在
    if os.path.exists(DB_PATH):
        response = input(f"\n数据库文件已存在：{DB_PATH}\n是否删除并重新创建？(y/n): ")
        if response.lower() == 'y':
            os.remove(DB_PATH)
            print("✓ 已删除旧数据库")
        else:
            print("✗ 取消操作")
            return
    
    # 创建数据库连接
    print(f"\n正在创建数据库：{DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 读取并执行 SQL 脚本
    print(f"正在读取 SQL 脚本：{SCHEMA_PATH}")
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    print("正在创建数据表...")
    cursor.executescript(schema_sql)
    conn.commit()
    
    print("✓ 数据表创建完成")
    
    # 插入测试数据
    insert_test_data(conn)
    
    # 验证数据库
    verify_database(conn)
    
    conn.close()
    print("\n" + "=" * 80)
    print("数据库初始化完成！")
    print(f"数据库位置：{DB_PATH}")
    print("=" * 80)


def insert_test_data(conn):
    """插入测试数据"""
    print("\n正在插入测试数据...")
    cursor = conn.cursor()
    
    try:
        # 1. 插入测试用户
        cursor.execute("""
            INSERT INTO users (username, password_hash, email, nickname, avatar)
            VALUES (?, ?, ?, ?, ?)
        """, ('test_user', 'hashed_password_123', 'test@example.com', '测试用户', None))
        
        user_id = cursor.lastrowid
        print(f"  ✓ 创建测试用户 (ID: {user_id})")
        
        # 2. 插入测试课程
        cursor.execute("""
            INSERT INTO user_courses 
            (user_id, course_name, teacher, day_of_week, start_time, end_time, 
             location, classroom, start_week, end_week)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, '高等数学', '张教授', '周一', '08:00', '09:40', 
              '教学楼A', 'A101', 1, 16))
        
        print("  ✓ 创建测试课程")
        
        # 3. 插入测试成绩
        cursor.execute("""
            INSERT INTO scores (user_id, subject, score, exam_type, exam_date)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, '数学', 95.0, '期中考试', '2024-01-15'))
        
        print("  ✓ 创建测试成绩")
        
        # 4. 插入测试目标
        cursor.execute("""
            INSERT INTO goals (user_id, title, description, category, target_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, '期末考试目标', '数学成绩达到90分以上', '学习', '2024-06-30', 'in_progress'))
        
        print("  ✓ 创建测试目标")
        
        # 5. 插入用户设置
        cursor.execute("""
            INSERT INTO user_settings (user_id, theme, daily_goal_minutes)
            VALUES (?, ?, ?)
        """, (user_id, 'light', 120))
        
        print("  ✓ 创建用户设置")
        
        conn.commit()
        print("✓ 测试数据插入完成")
        
    except sqlite3.Error as e:
        print(f"✗ 插入测试数据失败：{e}")
        conn.rollback()


def verify_database(conn):
    """验证数据库结构"""
    print("\n正在验证数据库结构...")
    cursor = conn.cursor()
    
    # 获取所有表名
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print(f"\n数据库包含 {len(tables)} 个表：")
    for i, (table_name,) in enumerate(tables, 1):
        # 获取表的行数
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  {i:2d}. {table_name:30s} ({count} 条记录)")
    
    print("\n✓ 数据库验证完成")


def show_database_info():
    """显示数据库信息"""
    if not os.path.exists(DB_PATH):
        print("数据库文件不存在，请先运行初始化")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("数据库信息")
    print("=" * 80)
    print(f"数据库路径：{DB_PATH}")
    print(f"文件大小：{os.path.getsize(DB_PATH) / 1024:.2f} KB")
    
    # 获取所有表
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print(f"\n共有 {len(tables)} 个表：")
    for table_name, in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  - {table_name}: {count} 条记录")
    
    conn.close()
    print("=" * 80)


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'info':
        show_database_info()
    else:
        init_database()
