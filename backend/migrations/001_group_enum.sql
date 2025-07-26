-- Migration: 20250726183100_migrate_groups_pk.sql
-- Description: Changes the primary key of the 'groups' table from 'id' to 'name'.

BEGIN TRANSACTION;

ALTER TABLE groups RENAME TO _old_groups;
CREATE TABLE groups (
    name TEXT PRIMARY KEY, -- 'name' is now the primary key
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO groups (name, description, created_at)
SELECT name, description, created_at
FROM _old_groups;

DROP TABLE _old_groups;


PRAGMA foreign_keys = OFF;

ALTER TABLE users RENAME TO _old_users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    "group" TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("group") REFERENCES groups(name) -- Added foreign key constraint
);

INSERT INTO users (id, username, password, email, "group", created_at)
SELECT id, username, password, email, "group", created_at
FROM _old_users;

DROP TABLE _old_users;

PRAGMA foreign_keys = ON;

COMMIT;
