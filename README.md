# BudgetBuddy

A simple budget tracking application with authentication.

## Features

- 📊 Monthly expense tracking
- 🏷️ Category management
- 💳 Payment method tracking
- 📱 Responsive design
- 🔐 Simple authentication system

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional)
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your credentials
   BUDGET_USERNAME=your_username
   BUDGET_PASSWORD=your_secure_password
   BUDGET_SESSION_SECRET=your_session_secret
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:5000
   - Login with your credentials (or defaults if no .env file)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BUDGET_USERNAME` | `admin` | Username for authentication |
| `BUDGET_PASSWORD` | `budget123` | Password for authentication |
| `BUDGET_SESSION_SECRET` | `budget-buddy-secret-key-2024` | Secret key for session management |
| `NODE_ENV` | `development` | Node environment |

## Default Credentials

If no environment variables are set, the application uses these defaults:
- **Username**: `admin`
- **Password**: `budget123`

## Production Deployment

For production deployment:

1. **Set secure environment variables**
   ```bash
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