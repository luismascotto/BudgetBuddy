# Expense Tracker Application

## Overview

This is a full-stack expense tracking application built with React, Express.js, and PostgreSQL. The application allows users to manage their personal finances by tracking expenses, categorizing them, and monitoring spending patterns. It features a modern UI built with shadcn/ui components and Tailwind CSS.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints
- **Middleware**: Express middleware for JSON parsing, logging, and error handling
- **Storage**: DatabaseStorage class implementing persistent data storage with automatic initialization

## Key Components

### Database Schema
- **Categories**: Expense categories with icons and colors
- **Payment Methods**: Different payment options (cash, PIX, credit cards) with billing cycles
- **Expenses**: Individual transactions with installment support and category/payment method references

### Core Features
- **Expense Management**: Create, read, update, and delete expenses
- **Category Organization**: Predefined categories with custom icons and colors
- **Payment Method Tracking**: Support for various payment types including credit cards with billing cycles
- **Installment Support**: Handle expenses split across multiple months
- **Monthly Overview**: Dashboard showing spending summaries and budget tracking
- **Monthly Projections**: Forecasting future expenses based on fixed costs and patterns

### UI Components
- **Dashboard**: Main view with expense overview, recent transactions, and category breakdowns
- **Expense Form**: Modal form for adding new expenses with payment method selection
- **Category Overview**: Visual breakdown of spending by category with progress indicators
- **Monthly Projection**: Forecast of upcoming month's expenses
- **Payment Method Selector**: Visual selection interface for different payment options

## Data Flow

1. **User Input**: Users interact with forms to add expenses through the expense form modal
2. **Client Validation**: React Hook Form with Zod schemas validate input client-side
3. **API Requests**: TanStack Query manages server communication and caching
4. **Server Processing**: Express routes handle CRUD operations with validation
5. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
6. **Response Handling**: Server returns JSON responses with proper error handling
7. **UI Updates**: TanStack Query automatically updates the UI when data changes

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider for production
- **Drizzle ORM**: Type-safe database operations and migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI/UX
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Primitive components for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for rapid development
- **In-Memory Storage**: Fallback storage for development without database
- **Replit Integration**: Custom plugins for Replit environment optimization

### Production Build
- **Client Build**: Vite builds optimized React application to `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### File Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Enhanced expense tracking with grouped installment transactions, period filtering, and improved UI layout
- July 05, 2025. Added PostgreSQL database with DatabaseStorage implementation and automatic data initialization

## User Preferences

Preferred communication style: Simple, everyday language.