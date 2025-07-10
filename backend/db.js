// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./survey.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "group" TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    answer TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS practice_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    answer TEXT NOT NULL,
    strategy TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT,
    task_id INT,
    is_practice BOOLEAN,
    response TEXT,
    correct BOOLEAN,
    time_spent INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;