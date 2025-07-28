-- This version starts from July 23rd

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS groups
(
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT UNIQUE NOT NULL, -- untrained trained expert admin
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO groups (id, name, description)
VALUES (1, 'untrained', 'Untrained group'),
       (2, 'trained', 'Trained group'),
       (3, 'expert', 'Expert group'),
       (0, 'admin', 'Admin group');

CREATE TABLE IF NOT EXISTS users
(
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,
  password   TEXT        NOT NULL,
  email      TEXT UNIQUE,
  "group"    TEXT        NOT NULL, -- foreign key to groups
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks
(
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,          -- just a name
  "group"    TEXT NOT NULL, -- foreign key to groups
  type       TEXT NOT NULL, -- exercise test strategy
  config     TEXT,          -- question order, quantity, etc. an later be extended into a foreign key table
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dot_material
(
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  location     TEXT    NOT NULL,
  dot_count    INTEGER NOT NULL,
  distribution TEXT,
  extra        TEXT
);

CREATE TABLE IF NOT EXISTS graph_material
(
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT NOT NULL, -- filename / URI
  usage    TEXT,
  extra    TEXT           -- optional attributes
);

CREATE TABLE IF NOT EXISTS questions
(
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  type         TEXT NOT NULL, -- dot_count dot_sort mst_*
  params       TEXT NOT NULL, -- for the question
  ground_truth TEXT NOT NULL, -- JSON or number
  strategy     TEXT,          -- Applicable strategy (nullable)
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS responses
(
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  response    TEXT,
  time_spent  INTEGER,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (question_id) REFERENCES questions (id)
);

CREATE TABLE IF NOT EXISTS task_question
(
  task_id     INTEGER NOT NULL,
  question_id INTEGER NOT NULL UNIQUE, -- let's just don't reuse questions
  seq_order   INTEGER,                 -- a task is a sequence of questions
  PRIMARY KEY (task_id, question_id),
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions (id)
);

CREATE TABLE IF NOT EXISTS question_material
(
  question_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  role        TEXT, -- NULL for dot counting and MST marking.
  PRIMARY KEY (question_id, material_id),
  FOREIGN KEY (question_id) REFERENCES questions (id),
  FOREIGN KEY (material_id) REFERENCES dot_material (id) ON DELETE CASCADE
);

COMMIT;
