# BM Project Tracker

Project management and documentation portal for BM Ecosystem.

## Tech Stack

- **Frontend:** Next.js 14.2 (React, TypeScript, Tailwind CSS)
- **Backend:** Express.js (Node.js, Socket.IO)
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5.19
- **Auth:** JWT with refresh tokens, bcryptjs
- **Deployment:** Docker Compose, nginx reverse proxy

## Local Development

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push --accept-data-loss
node prisma/seed.js
npm run dev
```

## Docker Deployment

### Prerequisites

- Docker & Docker Compose
- Domain pointing to your VPS
- nginx with SSL (Certbot/Let's Encrypt)

### Setup

```bash
git clone <repo> /root/BMProjectTracker
cd /root/BMProjectTracker
cp .env.example .env
# Edit .env as needed
docker compose up -d --build
docker exec bmprojecttracker-backend-1 npx prisma db push --accept-data-loss --skip-generate
docker exec bmprojecttracker-backend-1 node prisma/seed.js
docker restart bmprojecttracker-backend-1
```

> The container startup script (`docker:start`) automatically runs `prisma db push` so tables are created on fresh deployments. The manual `docker exec` above is only needed for initial setup to ensure everything is in sync.

### Ports

| Service  | Container | Host        |
|----------|-----------|-------------|
| Frontend | 3000      | 52403       |
| Backend  | 5000      | 52402       |
| Database | 5432      | 15432       |

### Volumes

- `projecttracker_pgdata` — PostgreSQL data (auto-created)

## Production (VPS)

**Domain:** https://bmdelivery.project.possibletechplc.com

**nginx Reverse Proxy** (`/etc/nginx/sites-enabled/bmdelivery.project.possibletechplc.com`):

```
location /api/     { proxy_pass http://localhost:52402; }
location /socket.io/ { proxy_pass http://localhost:52402; }
location /         { proxy_pass http://localhost:52403; }
```

### Container Restart

```bash
cd /root/BMProjectTracker
docker compose down && docker compose up -d --build
```

### Database — Reset & Seed

```bash
docker compose down -v   # ⚠️  destroys volume
docker compose up -d
docker exec bmprojecttracker-backend-1 npx prisma db push --accept-data-loss --skip-generate
docker exec bmprojecttracker-backend-1 node prisma/seed.js
docker restart bmprojecttracker-backend-1
```

### Credentials (seeded)

| Username  | Password       | Role  |
|-----------|----------------|-------|
| admin     | admin123       | ADMIN |
| mekdi     | mekdi1234      | USER  |
| haileab   | haileab1234    | USER  |
| yemisrach | yemisrach1234  | USER  |
| bereket   | bereket1234    | USER  |
| simret    | simret1234     | USER  |
| misgana   | misgana1234    | USER  |
| robera1   | robera1234     | USER  |
| robera2   | robera1234     | USER  |

## Known Issues & Fixes

### `pg_attribute` catalog corruption

If `prisma db push` fails with an error about `relnatts` mismatch:
```sql
UPDATE pg_class SET relnatts = <expected_count> WHERE relname = '<table_name>';
-- Then ALTER TABLE to add missing columns
```
See Git history for the full fix applied to the `Status` table.
