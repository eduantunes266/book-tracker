# 📚 ShelfLog – Personal Book Tracker

ShelfLog is a web application that helps readers keep track of their personal reading. Users can register, add books to their personal shelf and organise them by status: **read**, **reading** or **planned**. For each book they can record reading progress, a rating and personal notes. The app is aimed at hobby readers and students who want a simple, private place to manage their reading lists.

> Semester project for the courses *Web Application* and *Web Programming*.

## ✨ Features

- User registration and login (JWT authentication)
- Add a new book (title, author, total pages, status, optional cover image)
- View a list of your own books
- Edit a book (status, pages read, rating, notes)
- Delete a book
- Filter books by status and search by title or author

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS + Axios |
| Backend | Node.js + Express.js (TypeScript) + JWT + Multer |
| Database | MongoDB (Mongoose) |
| DevOps | Docker, Docker Compose |
| Tools | Git, GitHub Projects, Postman, VS Code |

## 📁 Project Structure

```
book-tracker/
├── backend/             # Express REST API (TypeScript)
├── frontend/            # React SPA (Vite + TypeScript)
├── docker-compose.yml   # MongoDB + backend + frontend
└── README.md
```

## 🚀 Getting Started

First create `backend/.env` from the example and fill in your own values:

```bash
cp backend/.env.example backend/.env
```

### Option 1 – Docker Compose (whole app)

Requires Docker Desktop. Uses a local MongoDB container (the `MONGODB_URI` in `backend/.env` is ignored; `JWT_SECRET` is used).

```bash
docker compose up --build
```

Open **http://localhost:3000**. Data and cover images are kept in Docker volumes between restarts.
Stop with `docker compose down` (add `-v` to also delete the data).

### Option 2 – Development mode

Requires Node.js and a MongoDB Atlas connection string in `backend/.env`.

```bash
# Terminal 1 – API on http://localhost:5000
cd backend
npm install
npm run dev

# Terminal 2 – React app on http://localhost:5173
cd frontend
npm install
npm run dev
```

In development, Vite forwards `/api` and `/uploads` to the backend (see `frontend/vite.config.ts`).

## 📋 Project Management

- **Project board:** [GitHub Project](LINK_TO_PROJECT_BOARD)

## 🗺️ Roadmap

- [x] **Milestone 1** – Concept and project setup
- [ ] **Milestone 2** – Backend: REST API, database, authentication
- [ ] **Milestone 3** – Frontend, Docker Compose, final documentation

---

*API documentation and screenshots will be added in the next milestones.*
