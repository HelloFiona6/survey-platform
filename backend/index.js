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