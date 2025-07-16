// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./survey.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    "group" TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- dots/mst
    params TEXT NOT NULL, -- JSON字符串，描述题目参数
    correct TEXT NOT NULL, -- 正确答案，JSON或数值
    strategy TEXT, -- 适用策略，可为空
    dot_count INTEGER, -- 点的数量
    distribution TEXT, -- 分布类型
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    question_id INTEGER,
    phase TEXT NOT NULL, -- practice/test
    response TEXT,
    correct BOOLEAN,
    time_spent INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(question_id) REFERENCES questions(id)
  )`);

  // 插入管理员账号（如不存在）
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      db.run('INSERT INTO users (username, password, "group") VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
    }
  });
});

module.exports = db;