// backend/db.js
const migrations = require("./migrate");
const sqlite3 = require('sqlite3').verbose();

class SurveyDB {
  constructor() {
    this.db = new sqlite3.Database('./survey.db', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        throw err;
      } else {
        console.log('Connected to the SQLite database.');
      }
    });
  }

  async is_fine() {
    return new Promise((resolve) => {
      this.db.get('SELECT 1', (err, row) => {
        resolve(!err && row);
      });
    });
  }

  run(sql, params = [], callBack=undefined) {    return this.db.run(sql, params, callBack);  }
  get(sql, params = [], callBack=undefined) {    return this.db.get(sql, params, callBack);  }
  all(sql, params = [], callBack=undefined) {    return this.db.all(sql, params, callBack);  }
  each(sql, params, rowCallback, completeCallback) {    return this.db.each(sql, params, rowCallback, completeCallback);  }
  exec(sql, callBack=undefined) {    return this.db.exec(sql, callBack);  }
  close() {    return this.db.close();  }

  runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
  getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  prepareAsync(sql) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(stmt);
        }
      });
    });
  }
  async migrateAsync() {
    const db = this.db;
    try {
      await migrations.run(db);
      // 插入管理员账号（如不存在）
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (!row) {
          db.run('INSERT INTO users (username, password, "group") VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
        }
      });
    } catch (err) {
      db.close();
      console.error('Migration failed:', err);
      process.exit(1);
    }
  }
}

module.exports = SurveyDB;