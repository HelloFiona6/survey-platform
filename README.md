# Survey Platform Startup Manual (with SQLite)

## Project Structure

```
survey-platform/
├── backend/      # Node.js + Express backend (with SQLite)
├── frontend/     # React + Ant Design frontend
└── README.md     # This manual
```

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 14+ recommended)
- npm (comes with Node.js)

No need to install or configure any database!

---

## 2. Clone the Project

```bash
git clone https://github.com/HelloFiona6/survey-platform.git survey-platform
cd survey-platform
```

---

## 3. Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Database Initialization

Due to the complexity of experimental design details (like which images should be assigned to whom at which time), 
for now we manually load questions and tasks into the database.

- generate images under ./image folder using the Python script
- in the database, edit and connect questions to images
- edit tasks and assign questions to them

The register_images module receives an existing database object and loads ./image information into it automatically.

More SQL scripts or JS scripts will come to automate more works.

### 3.3 Start the Backend Server

```bash
npm run dev
```
- The backend will run on [http://localhost:5000](http://localhost:5000)
- You should see `Server running on port 5000` in the terminal.

If you encounter `Error: Cannot find module 'sqlite3'`, run `npm install sqlite3` first.
---

## 4. Frontend Setup

### 4.1 Install Dependencies

```bash
cd ../frontend
npm install
```

### 4.2 Start the Frontend Server

```bash
npm start
```
- The frontend will run on [http://localhost:3000](http://localhost:3000)
- Open this URL in your browser to access the survey platform.

---

## 5. Directory Overview

- `backend/`  
  Node.js + Express backend, includes all API logic and the SQLite database file (`survey.db` will be created automatically).
- `frontend/`  
  React frontend, user interface for participants and (optionally) admins.
- `survey.db`  
  The SQLite database file (auto-generated in the `backend/` directory).

---

## 6. Common Issues

- **Port already in use**: Change the port in `backend/index.js` or `frontend/package.json` if needed.
- **CORS errors**: The backend has CORS enabled by default. If you encounter issues, check the CORS settings in `backend/index.js`.
- **Database file not created**: Make sure you have write permissions in the `backend/` directory.

---

## 7. How It Works

- On first backend startup, all necessary tables are created in `survey.db`.
- All data (users, tasks, responses, etc.) is stored in this file.
- No external database server is required.

---

## 8. Useful Scripts

From the `backend/` directory:
- `npm run dev` — Start backend in development mode (with auto-reload)
- `npm start` — Start backend in production mode

From the `frontend/` directory:
- `npm start` — Start frontend development server

---

## 9. Resetting the Database

The database indexes image resources strictly by file names. Resetting may be tricky.

Luckily, we decouple questions and images, so modifications are limited in 2 tables.

