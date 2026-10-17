# BudgetBuddy

A simple budget tracking application with authentication.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express, TypeScript, Passport.js (local strategy)
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: express-session with memorystore

## Features

- 📊 Monthly expense tracking
- 🏷️ Category management
- 💳 Payment method tracking
- 📱 Responsive design
- 🔐 Simple authentication system

## Quick Start

### Option 1: Docker (Recommended)

Uses Docker Compose to run the app with PostgreSQL automatically configured.

```bash
# Using the convenience script
./start-dev.sh

# Or directly with docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

Access the application at http://localhost:5000

See [README-DOCKER.md](./README-DOCKER.md) for detailed Docker instructions.

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your values
   # Required:
   DATABASE_URL=postgresql://user:password@localhost:5432/budgetbuddy
   
   # Optional (authentication):
   BUDGET_USERNAME=your_username
   BUDGET_PASSWORD=your_secure_password
   BUDGET_SESSION_SECRET=your_session_secret
   ```

3. **Set up PostgreSQL database**
   - Install and run PostgreSQL locally
   - Create a database named `budgetbuddy`
   - Update `DATABASE_URL` in `.env` with your credentials
   - Run migrations: `npm run db:push`

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Note: On Linux/macOS, use `NODE_ENV=development npm run dev` or the provided script `./start-dev.sh` (Docker-based)

5. **Access the application**
   - Open http://localhost:5000
   - Login with your credentials (or defaults if not configured)

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | none | Yes | PostgreSQL connection string |
| `BUDGET_USERNAME` | `admin` | No | Username for authentication |
| `BUDGET_PASSWORD` | `budget123` | No | Password for authentication |
| `BUDGET_SESSION_SECRET` | `budget-buddy-secret-key-2024` | No | Secret key for session management |
| `NODE_ENV` | `development` | No | Node environment |

## Default Credentials

If no environment variables are set, the application uses these defaults:
- **Username**: `admin`
- **Password**: `budget123`

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production (client + server)
npm start          # Run production build
npm run check      # TypeScript type checking
npm run db:push    # Push database schema changes
```

## Production Deployment

For production deployment:

1. **Set secure environment variables**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/budgetbuddy
   BUDGET_USERNAME=your_secure_username
   BUDGET_PASSWORD=your_very_secure_password
   BUDGET_SESSION_SECRET=your_random_session_secret
   NODE_ENV=production
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Security Notes

- Change default credentials in production
- Use a strong session secret
- Enable HTTPS in production
- Consider using a proper session store (Redis) for production