# Task API — Node.js + Express + PostgreSQL

A simple REST API for managing tasks (CRUD), backed by PostgreSQL, running as
two Docker containers (app + database) via `docker-compose`, deployed
automatically to AWS EC2 through a Jenkins CI/CD pipeline.

This project is meant as a deployment-practice exercise — the "app" itself is
intentionally simple (a task list); the real learning is in Docker Compose
(multi-container apps) and the CI/CD pipeline.

## API Endpoints

| Method | Endpoint       | Description            |
|--------|----------------|-------------------------|
| GET    | /health        | Check API + DB status  |
| GET    | /tasks         | List all tasks         |
| GET    | /tasks/:id     | Get one task            |
| POST   | /tasks         | Create a task (`{ "title": "..." }`) |
| PUT    | /tasks/:id     | Update a task           |
| DELETE | /tasks/:id     | Delete a task            |

---

## 1. Run locally (with Docker Compose)

Requires Docker + Docker Compose installed.

```bash
docker compose up -d --build
```

This starts two containers:
- `task-api` — the Node.js app on port 3000
- `task-db` — PostgreSQL, with data persisted in a Docker volume

Test it:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Learn Docker Compose"}'
curl http://localhost:3000/tasks
```

Stop everything:
```bash
docker compose down
```
(Add `-v` to also delete the database volume: `docker compose down -v`)

---

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Task API - Node + Express + PostgreSQL"
git branch -M main
git remote add origin https://github.com/Mayankkemani/TaskAPI.git
git push -u origin main
```

(Create the empty repo `task-api` on GitHub first, same as before — no README/gitignore checked, since we already have our own.)

---

## 3. Jenkins Pipeline Setup

Since Jenkins is already running on the same EC2 instance as the deployment
target, this pipeline is simpler than the game's — no SSH/SCP needed. Jenkins
builds and runs `docker compose` directly on the same machine.

1. Jenkins Dashboard → **New Item** → name it `task-api-deploy` → type **Pipeline** → OK
2. **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/Mayankkemani/TaskAPI.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. **Save**, then **Build Now**

The pipeline will:
1. Pull the latest code from GitHub
2. Stop any old containers (`docker compose down`)
3. Build and start fresh containers (`docker compose up -d --build`)
4. Wait for `/health` to respond, confirming the app + DB are both up

---

## 4. Open the port on AWS

The API runs on **port 3000** — this needs to be opened in the EC2 Security
Group (same place you opened 80, 8080, 22 before):

- Type: Custom TCP
- Port: 3000
- Source: 0.0.0.0/0 (or restrict as needed)

Then test from your browser or terminal:
```
http://<your-ec2-ip>:3000/tasks
```

---

## 5. Notes on this being a *learning* project

- No authentication — do not use as-is for anything holding real data.
- Database credentials are hardcoded in `docker-compose.yml` for simplicity;
  in a real project these would come from Jenkins credentials / secrets
  manager, injected as environment variables at deploy time.
- Data persists across container restarts (Docker volume) but would be lost
  if the volume is deleted (`docker compose down -v`).
