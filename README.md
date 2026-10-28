# Pet Care Log

A beginner-friendly full-stack web application for keeping pet profiles and their care history in one place.

## Problem statement
Pet owners may need to remember several details, including feeding routines, health checks, vaccination dates and vet appointments. Pet Care Log puts these notes into one dashboard so they are easier to review.

## Objectives
- Maintain basic profiles for pets.
- Save and review health, feeding, medication, grooming and appointment records.
- Keep optional next-care dates alongside records.
- Demonstrate a frontend, REST API and PostgreSQL database working together.

## Features
- Add and search pet profiles.
- Add care records connected to a pet.
- Filter care history by record type.
- Delete a pet and its related records, or delete an individual record.
- Dashboard counters and responsive layout.
- Backend input validation and database constraints.

## Technology stack
HTML5, CSS3, Vanilla JavaScript, Node.js, Express, Supabase PostgreSQL.

## Folder structure
```text
pet-care-log/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/
│   │   ├── pets.js
│   │   └── records.js
│   ├── server.js
│   ├── supabase.js
│   ├── utils.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## Prerequisites
- [Node.js LTS](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- A free [Supabase](https://supabase.com/) account
- Git only if you plan to upload the project to GitHub

Check Node and npm in the VS Code terminal:
```powershell
node -v
npm -v
```

## Setup on Windows

### 1. Create a Supabase project
1. Sign in to Supabase and create a new project.
2. Wait until the database is ready.
3. Open **SQL Editor** in the Supabase dashboard.
4. Open `database/schema.sql` from this project, copy all its SQL, paste it into the SQL Editor and click **Run**.
5. Open **Table Editor** and confirm `pets` and `care_records` exist.

### 2. Configure environment variables
1. Open the `backend` folder in VS Code.
2. Copy `.env.example` to a new file named `.env`.
3. In Supabase project settings, find the project URL and the server-side secret/service-role key for your project.
4. Put those values in `backend/.env`:
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SECRET_KEY
```
Use your actual values; placeholders will not connect. Keep `.env` private. Never put this key in `frontend/app.js`, HTML, GitHub or screenshots. Do not share it in chats.

### 3. Install dependencies
Open the VS Code terminal at the project root, then run:
```powershell
cd backend
npm install
```
Wait for installation to finish.

### 4. Start the app
In the same terminal, run:
```powershell
npm start
```
Expected message:
```text
Pet Care Log running at http://localhost:3000
```
Open `http://localhost:3000` in your browser. Keep the terminal open while using the app.

### 5. Test the API
Open `http://localhost:3000/api/health`. You should see JSON with `"status":"ok"` and `"databaseConfigured":true` when environment variables are present. This confirms configuration is loaded; test creating a pet in the UI to confirm database access.

## API endpoints

| Method | Path | Purpose | Request body |
|---|---|---|---|
| GET | `/api/health` | Check server status | None |
| GET | `/api/pets` | List pets | None |
| POST | `/api/pets` | Create a pet | `name`, `species`; optional `breed`, `birth_date`, `weight_kg`, `notes` |
| DELETE | `/api/pets/:id` | Delete pet and related records | None |
| GET | `/api/records` | List care records | None |
| POST | `/api/records` | Create a care record | `pet_id`, `type`, `record_date`, `title`; optional `details`, `next_date` |
| DELETE | `/api/records/:id` | Delete one care record | None |

This student MVP has no user login and is intended for local demonstration by one student. The API uses a privileged server-side database key. **Do not deploy it publicly or share it with other users as-is.** A public version needs authentication, per-user data ownership, authorization checks and carefully designed RLS policies. The database has RLS enabled but no public policies; database access is expected through the server-side key only.

## Architecture
Browser UI (HTML/CSS/JS) → `fetch()` → Express API → Supabase PostgreSQL.

## Manual test checklist
1. Start the server and open the home page.
2. Add a pet with a name and species; it should appear in Pet profiles.
3. Refresh the page; the pet should still appear (database persistence).
4. Search for the pet by name.
5. Add a feeding record and a health record; both should appear in Care history.
6. Change the history filter and confirm only the selected type appears.
7. Try submitting a pet without a name; the browser should require it.
8. Delete a care record and confirm it disappears.
9. Delete a pet and confirm its related records are also removed.
10. Resize the browser to check the mobile layout.

## Troubleshooting
- **Database is not configured:** Confirm `backend/.env` exists and contains the correct values, then stop and restart `npm start`.
- **Could not load/save data:** Check the Supabase URL and server-side key, verify that `database/schema.sql` ran successfully, and inspect the terminal for server-side errors.
- **Cannot find module:** Run `cd backend` and `npm install`.
- **Port is in use:** Change `PORT=3000` to `PORT=3001` in `backend/.env`, restart, then open `http://localhost:3001`.
- **Changes do not appear:** Refresh the browser; restart the server after backend changes.

## GitHub upload (optional)
Install Git from [git-scm.com](https://git-scm.com/download/win), open a new terminal and check `git --version`. From the project root:
```powershell
git init
git status
git add .
git status
git commit -m "Build Pet Care Log"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Create an empty repository on GitHub first and replace `YOUR_GITHUB_REPOSITORY_URL` with its URL. Verify `backend/.env` and `node_modules/` are not staged. If you ever expose a credential, rotate it immediately; `.gitignore` does not erase a secret already committed.

## Limitations and future improvements
- No user registration or login in this MVP.
- No automatic email/SMS reminders; next dates are recorded for users to review.
- Future work could add user accounts, per-user privacy, calendar reminders, vaccinations report exports and photo uploads.
