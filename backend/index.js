// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const fs = require('fs');
const path = require('path');
const imagesDir = path.join(__dirname, 'images');

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// 用户注册/登录与分组分配
app.post('/api/register', (req, res) => {
  const { username, group } = req.body;
  if (!username || !group) {
    return res.status(400).json({ error: 'Username and group are required.' });
  }
  db.run(
    'INSERT INTO users ("group") VALUES (?)',
    [group],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
      res.json({ id: this.lastID, username, group });
    }
  );
});

// 用户登录（仅允许已存在用户登录）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
    res.json({ id: user.id, username: user.username, group: user.group });
  });
});

// 管理员端：获取所有用户
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, "group", created_at FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

// 管理员端：增删改查用户
app.post('/api/user', (req, res) => {
  const { username, password, group } = req.body;
  if (!username || !password || !group) {
    return res.status(400).json({ error: 'Missing fields.' });
  }
  db.run('INSERT INTO users (username, password, "group") VALUES (?, ?, ?)', [username, password, group], function(err) {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ id: this.lastID });
  });
});

app.put('/api/user/:id', (req, res) => {
  const { password, group } = req.body;
  db.run('UPDATE users SET password = ?, "group" = ? WHERE id = ?', [password, group, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/user/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json({ changes: this.changes });
  });
});

// 管理员端：查询所有作答情况
app.get('/api/responses', (req, res) => {
  db.all(`SELECT responses.*, users.username, users.group FROM responses LEFT JOIN users ON responses.user_id = users.id`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    res.json(rows);
  });
});

// 获取Dots题目
app.get('/api/dots-questions', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  db.all(
    'SELECT id, params, correct, strategy, created_at FROM questions WHERE type = ? ORDER BY RANDOM() LIMIT ?',
    ['dots', count],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
      res.json(rows);
    }
  );
});

// 提交答题
app.post('/api/response', (req, res) => {
  const { user_id, question_id, phase, response, correct, time_spent } = req.body;
  if (!user_id || !question_id || !phase) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  db.run(
    'INSERT INTO responses (user_id, question_id, phase, response, correct, time_spent) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, question_id, phase, response, correct, time_spent],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// 获取主任务题目（仅点数估计题）
app.get('/api/main-tasks', (req, res) => {
  const userId = req.query.user_id;
  // 这里只返回 type 为 dots 的题目，image 字段为图片URL
  db.all(
    'SELECT id, type, params FROM questions WHERE type = ? ORDER BY id',
    ['dots'],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      // params 字段中提取图片名，拼接为图片URL
      const tasks = rows.map(row => {
        let img = '';
        try {
          const params = JSON.parse(row.params);
          img = params.img ? `http://localhost:5000/images/${params.img}` : '';
        } catch {}
        return {
          id: row.id,
          type: row.type,
          image: img
        };
      });
      res.json(tasks);
    }
  );
});

function initQuestionsFromImages() {
  const files = fs.readdirSync(imagesDir).filter(f =>
    /\.(png|jpg|jpeg|gif)$/i.test(f)
  );
  let pending = files.length;
  if (pending === 0) return;
  files.forEach((img) => {
    db.get(
      "SELECT id FROM questions WHERE params = ?",
      [JSON.stringify({ img })],
      (err, row) => {
        if (err) {
          console.error(err);
          if (--pending === 0) return;
        }
        if (!row) {
          db.run(
            "INSERT INTO questions (type, params, correct, strategy) VALUES (?, ?, ?, ?)",
            [
              "dots",
              JSON.stringify({ img }),
              "", // correct 答案可后续补充
              null
            ],
            function (err) {
              if (err) {
                console.error(err);
              } else {
                console.log(`Inserted question for image: ${img}`);
              }
              if (--pending === 0) return;
            }
          );
        } else {
          console.log(`Question for image ${img} already exists.`);
          if (--pending === 0) return;
        }
      }
    );
  });
}

// 在服务启动时自动插入
initQuestionsFromImages();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});