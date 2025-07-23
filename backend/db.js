// backend/db.js
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

  is_fine() {
    let fine = true;
    db.get('SELECT 1', (err, row) => {
      if (err) {
        fine = false;
      }
    });
    return fine;
  }

  run(sql, params = [], callBack=undefined) {
    return this.db.run(sql, params, callBack);
  }

  get(sql, params = [], callBack=undefined) {
    return this.db.get(sql, params, callBack);
  }

  all(sql, params = [], callBack=undefined) {
    return this.db.all(sql, params, callBack);
  }

  exec(sql, callBack=undefined) {
    return this.db.exec(sql, callBack);
  }

  close() {
    return this.db.close();
  }
}

const db = new SurveyDB();

runMigrations(db).catch(err => {db.close(); console.error(err); exit(1);});
// 插入管理员账号（如不存在）
db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
  if (!row) {
    db.run('INSERT INTO users (username, password, "group") VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
  }
});

module.exports = db;