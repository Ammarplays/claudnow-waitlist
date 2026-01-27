# ClawdNow Waitlist

Simple waitlist landing page with PostgreSQL backend.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   ```

3. **Run:**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/waitlist` | Join waitlist |
| GET | `/api/waitlist/count` | Get total signups |

## Database Schema

```sql
CREATE TABLE waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    platform VARCHAR(50),
    usecases TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Table is auto-created on first run.

## Deploy

Works with any Node.js host:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- VPS with PM2

Just set `DATABASE_URL` environment variable.
