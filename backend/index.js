// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const SurveyDB = require('./db');
const imageRegistration = require('./register_images');

const imagesDir = imageRegistration.imagesDir;
const PORT = 5000;
const BACKEND_DOMAIN = "http://localhost";

// entry point for the backend server
(async function () {

const db = new SurveyDB();
await db.migrateAsync();
if (!await db.is_fine()) {
  console.error('Database is not fine, exiting...');
  db.close();
  process.exit(1);
}
// Ensures db is open and migrated

// 在服务启动时自动插入
await imageRegistration.init(db);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(imagesDir));

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
    'UPDATE users SET "group" = ? WHERE username = ?',
    [group, username],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
      res.json({ message: 'User group updated successfully.', username, group });
    }
  );
});

// 用户登录（仅允许已存在用户登录）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
      res.json({ id: user.id, username: user.username, group: user.group });
    }
  );
});

// 管理员端：获取所有用户
app.get('/api/users', (req, res) => {
  db.all(
    'SELECT id, username, "group", created_at FROM users',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json(rows);
    }
  );
});

// 管理员端：增删改查用户
app.post('/api/user', (req, res) => {
  const { username, password, group } = req.body;
  if (!username || !password || !group) {
    return res.status(400).json({ error: 'Missing fields.' });
  }
  db.run(
    'INSERT INTO users (username, password, "group") VALUES (?, ?, ?)',
    [username, password, group],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/user/:id', (req, res) => {
  const { password, group } = req.body;
  db.run(
    'UPDATE users SET password = ?, "group" = ? WHERE id = ?',
    [password, group, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ changes: this.changes });
    }
  );
});

app.delete('/api/user/:id', (req, res) => {
  db.run(
    'DELETE FROM users WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json({ changes: this.changes });
    }
  );
});

// 管理员端：查询所有作答情况
app.get('/api/responses', (req, res) => {
  db.all(
    `SELECT responses.*, users.username, users.group FROM responses LEFT JOIN users ON responses.user_id = users.id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      res.json(rows);
    }
  );
});

// 获取Dots题目
app.get('/api/dots-questions', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  db.all(
    'SELECT id, params, ground_truth, strategy, created_at FROM questions WHERE type = ? ORDER BY RANDOM() LIMIT ?',
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
  const { user_id, question_id, phase, response, correct, time_spent } = req.body;  // TODO remove phase and correct?
  if (!user_id || !question_id || !phase) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  db.run(
    'INSERT INTO responses (user_id, question_id, response, time_spent) VALUES (?, ?, ?, ?)',
    [user_id, question_id, response, time_spent],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error.' });
      }
      res.json({ id: this.lastID });
    }
  );
});

/* // 获取主任务题目（仅点数估计题）
app.get('/api/main-tasks', (req, res) => {
  const userId = req.query.user_id;
  // 这里只返回 type 为 dots 的题目，image 字段为图片URL
  db.all(
    'SELECT id, type, params FROM questions WHERE type = ? ORDER BY id limit 10',
    ['dots'],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error.' });
      // params 字段中提取图片名，拼接为图片URL
      const tasks = rows.map(row => {
        let img = '';
        let distribution = '';
        try {
          const params = JSON.parse(row.params);
          img = params.img ? `${BACKEND_DOMAIN}:${PORT}/images/${params.img}` : '';
          distribution = params.distribution || '';
        } catch {}
        return {
          id: row.id,
          type: row.type,
          image: img,
          distribution: distribution
        };
      });
      res.json(tasks);
    }
  );
}); */

/**
 * 获取默认任务题目
 * 单个SQL查询，找出所有符合给定 用户ID、任务阶段、题目类型 的题目
 */
app.get('/api/main-tasks', (req, res) => {
  // Does SQLite have predicate/selection pushdown?
  const sql = `
    WITH T AS (
      SELECT id FROM tasks
      WHERE 
        "group" IN (
          SELECT "group" FROM users WHERE users.id = ?
        ) AND tasks.type = ?
    ),
    Q AS (
      SELECT questions.type as type, question_id
      FROM
        T 
        JOIN task_question ON T.id = task_question.task_id
        JOIN questions ON questions.id = task_question.question_id
      WHERE questions.type = ?
    )
    SELECT
      Q.question_id AS id,
      Q.type AS type,
      DM.location AS location,
      DM.distribution AS distribution
    FROM
      Q
      JOIN question_material AS QM ON Q.question_id = QM.question_id
      JOIN dot_material AS DM ON DM.id = QM.material_id
    ORDER BY RANDOM() LIMIT 10
  `;
  let tasks = [];
  const userId = req.query.user_id;
  db.each(sql, [userId, 'test', 'dots'],  // defaults
    (err, row) => {  // rowCallback
      if (err) {
        console.error('Error fetching row:', err.message);
        return;
      }
      tasks.push({
        id: row.id,
        type: row.type,
        image: `${BACKEND_DOMAIN}:${PORT}/images/${row.location}`,
        distribution: row.distribution || ''
      });
    },
    (err, count) => {  // completionCallback
      if (err) {
        console.error('Error during db.each completion:', err.message);
        return res.status(500).json({ error: 'Database error fetching tasks.' });
      }
      if (tasks.length === 0) {
        return res.status(404).json({ message: 'No dot counting tasks found.' });
      }
      res.json(tasks);
      console.log(`Sent ${count} dot counting tasks.`);
    }
  );
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

})();
