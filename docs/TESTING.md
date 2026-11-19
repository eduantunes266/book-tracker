# 🧪 Testing – ShelfLog

This document describes how ShelfLog was tested and lists the test cases with their results.

## Strategy

| Part | How it is tested | Tools |
|---|---|---|
| **REST API** | Every endpoint is called with valid and invalid data. Each request checks the status code and the JSON response (`{ "message": "..." }` for errors). | Postman collection [`docs/postman/ShelfLog.postman_collection.json`](postman/ShelfLog.postman_collection.json) (21 test assertions), plus extra requests with `curl` for the error cases |
| **Frontend** | Manual test cases: open the app in the browser, perform the steps (typing, clicking, choosing files) and compare with the expected result, on desktop (1280 px) and phone width (375 px). | Browser (Microsoft Edge) – the steps were executed by a small script that types and clicks like a user and takes screenshots |
| **Docker** | Fresh clone of the repository, follow only the README, start with `docker compose up --build`, use the app. | Docker Desktop, browser |

There are no automated unit tests (see *Known limitations* in the README).

**How to run the API tests yourself:** start the backend (`npm run dev` in `backend/`), import the Postman collection and use **Run collection**. All requests should pass. The "Register" request accepts `201` (new account) or `409` (account already exists), so the collection can be run more than once.

All test data (test users, books and cover files) was deleted after each run.

## Test cases

Result legend: ✅ Pass – ❌ Fail. The date says when the result was obtained.
API results: 2026-11-19. Frontend results: 2026-11-11 (frontend and backend code have not changed since).

### Authentication

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| AUTH-01 | Register a new user | `POST /api/auth/register` with name, new email, password `secret123` | `201`, response has `token` and `user { id, name, email }`, no password | ✅ Pass |
| AUTH-02 | Register with an existing email | Repeat AUTH-01 with the same email | `409` "Email is already registered" | ✅ Pass |
| AUTH-03 | Register with a short password | Password `123` | `400` "Password must have at least 6 characters" | ✅ Pass |
| AUTH-04 | Register with an invalid email | Email `not-an-email` | `400` "A valid email is required" | ✅ Pass |
| AUTH-05 | Login with correct data | `POST /api/auth/login` | `200`, `token` returned (Postman saves it in `{{token}}`) | ✅ Pass |
| AUTH-06 | Login with wrong password | Correct email, password `wrong-password` | `401` "Invalid email or password" | ✅ Pass |
| AUTH-07 | Login with unknown email | Email that is not registered | `401` "Invalid email or password" (same message, does not reveal if the email exists) | ✅ Pass |
| AUTH-08 | Password is stored as a hash | Look at the user document in MongoDB | Only `passwordHash` (`$2b$10$...`), never the plain password | ✅ Pass (checked 2026-11-10) |
| AUTH-09 | Books without token | `GET /api/books` without `Authorization` header | `401` "No token provided" | ✅ Pass |
| AUTH-10 | Books with invalid token | `Authorization: Bearer abc.def.ghi` | `401` "Invalid or expired token" | ✅ Pass |

### Books – CRUD

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| BOOK-01 | Create a book (form-data, no cover) | `POST /api/books` with title, author, totalPages, pagesRead, status, rating, notes | `201`, book returned with `_id` and `userId` | ✅ Pass |
| BOOK-02 | Create with only required fields | title, author, totalPages | `201`, defaults: `pagesRead 0`, `status "planned"`, `notes ""` | ✅ Pass |
| BOOK-03 | List own books | `GET /api/books` | `200`, array, newest first | ✅ Pass |
| BOOK-04 | Get one book | `GET /api/books/{{bookId}}` | `200`, the same book | ✅ Pass |
| BOOK-05 | Update some fields | `PUT /api/books/{{bookId}}` with `pagesRead 310`, `status "read"` | `200`, only these fields changed | ✅ Pass |
| BOOK-06 | Remove the rating | `PUT` with `"rating": null` | `200`, `rating: null` | ✅ Pass |
| BOOK-07 | Delete a book | `DELETE /api/books/{{bookId}}` | `200` "Book deleted"; deleting again → `404` | ✅ Pass |
| BOOK-08 | Get a non-existing id | `GET /api/books/000000000000000000000000` | `404` "Book not found" | ✅ Pass |
| BOOK-09 | Read another user's book | User A requests user B's book id | `404` "Book not found" | ✅ Pass |
| BOOK-10 | Delete another user's book | User A deletes user B's book | `404`, book still exists | ✅ Pass |

### Filter and search

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| FILT-01 | Filter by status | `GET /api/books?status=reading` | `200`, every book has `status "reading"` | ✅ Pass |
| FILT-02 | Invalid status filter | `GET /api/books?status=finished` | `400` "Status must be "read", "reading" or "planned"" | ✅ Pass |
| SRCH-01 | Search by author | `GET /api/books?search=tolkien` | `200`, contains "The Hobbit" | ✅ Pass |
| SRCH-02 | Search is partial and case-insensitive | Type `HOB` in the search box | Only "The Hobbit" is shown | ✅ Pass |
| SRCH-03 | Search + filter combined, no match | Search `HOB` + status "Read" | "No books match your filters." | ✅ Pass |
| SRCH-04 | Search waits for typing to stop | Type `orwell` letter by letter | Only 1 request is sent (300 ms debounce) | ✅ Pass |

### Cover upload

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| UPL-01 | Create with a cover | `POST /api/books` form-data with `cover` = PNG image | `201`, `coverImage` set; `GET /uploads/<coverImage>` → `200` image | ✅ Pass |
| UPL-02 | Wrong file type | `cover` = text file | `400` "Only JPG, PNG, WEBP or GIF images are allowed" | ✅ Pass |
| UPL-03 | File too large | `cover` = 6 MB image | `400` "Cover image must be at most 5 MB" | ✅ Pass |
| UPL-04 | Replace the cover | Edit the book and choose a new image | New image shown; old file deleted on the server (`404`) | ✅ Pass |
| UPL-05 | Delete book removes the cover | Delete a book that has a cover | Image file deleted (`GET /uploads/...` → `404`) | ✅ Pass |
| UPL-06 | Failed request leaves no file | Valid image but missing title | `400`, no new file in `backend/uploads` | ✅ Pass (checked 2026-11-11) |

### Validation and other errors

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| VAL-01 | Missing title | `POST /api/books` without `title` | `400` "Title is required" | ✅ Pass |
| VAL-02 | Pages read greater than total | `totalPages 10`, `pagesRead 20` | `400` "Pages read cannot be greater than total pages" | ✅ Pass |
| VAL-03 | Invalid status | `status "done"` | `400` with the allowed values | ✅ Pass |
| VAL-04 | Rating out of range | `rating 7` | `400` "Rating must be a whole number from 1 to 5" | ✅ Pass |
| ERR-01 | Malformed JSON body | Body `{bad` with `Content-Type: application/json` | `400` "Invalid JSON in request body" (JSON, no stack trace) | ✅ Pass |
| ERR-02 | Unknown route | `GET /api/nothing-here` | `404` "Route not found" | ✅ Pass |

### Frontend (manual)

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| UI-01 | Protected page | Open `/` without being logged in | Redirect to `/login` | ✅ Pass |
| UI-02 | Register | Fill name, email, password → "Create account" | Logged in, "My books" page with "Log out" button | ✅ Pass |
| UI-03 | Register with existing email | Use an email that already exists | Red message "Email is already registered" | ✅ Pass |
| UI-04 | Short password in the form | Type `123` and submit | Browser blocks the form (min. 6 characters) | ✅ Pass |
| UI-05 | Login with wrong password | Wrong password → "Log in" | Red message "Invalid email or password", stays on `/login` | ✅ Pass |
| UI-06 | Log out | Click "Log out" | Token removed, back to `/login` | ✅ Pass |
| UI-07 | Expired / invalid session | Invalid token in localStorage, open `/` | Redirect to `/login` with "Your session has expired" | ✅ Pass |
| UI-08 | Backend not running | Stop the backend, try to log in | "Cannot reach the server. Is the backend running?" | ✅ Pass |
| UI-09 | Add a book with cover | "+ Add book" → fill form, choose image (preview shown) → "Add book" | Back to the list, card with cover, status, progress and rating | ✅ Pass |
| UI-10 | Form validation | Submit empty form; pages read > total; text file / 6 MB file as cover | Browser blocks the form; cover errors shown before upload | ✅ Pass |
| UI-11 | Edit a book | "Edit" → form is pre-filled → change fields → "Save changes" | List shows the new values | ✅ Pass |
| UI-12 | Cancel editing | "Edit" → "Cancel" | Back to the list, nothing changed | ✅ Pass |
| UI-13 | Delete with confirmation | "Delete" → Cancel in the dialog, then "Delete" → OK | First time the book stays; second time it is removed | ✅ Pass |
| UI-14 | Edit another user's book by URL | Open `/books/<other user's id>/edit` | "Book not found" + "Back to my books" | ✅ Pass |
| UI-15 | Empty states | New user / filters with no result | "You have no books yet." / "No books match your filters." | ✅ Pass |
| UI-16 | Mobile layout | Phone width 375 px: login, list, form | Everything fits the screen, no horizontal scroll, fields stacked | ✅ Pass |
| UI-17 | Accented text | Add a book "Coração de Leão" by "Saint-Exupéry" | Saved and shown correctly | ✅ Pass (checked 2026-11-11) |

### Docker

| ID | Description | Steps | Expected result | Result |
|---|---|---|---|---|
| DOCK-01 | Fresh clone with Docker | Clone the repository, follow only the README "Getting Started" → Option 1 | Three containers run, app on http://localhost:3000: register, add a book with cover, list, direct link to `/books/new` all work | ✅ Pass (2026-11-19) |
| DOCK-02 | Data survives a restart | Add a book with cover → `docker compose down` → `docker compose up` | Book and cover still there | ✅ Pass (2026-11-11) |
| DOCK-03 | Missing `backend/.env` | Run `docker compose up` without creating `backend/.env` | Compose stops with "env file ... backend/.env not found" | ✅ Pass (2026-11-19) |
