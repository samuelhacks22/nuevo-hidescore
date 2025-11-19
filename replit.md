# HideScore v3.1 - Replit Setup

## Overview
HideScore is a full-stack web application for discovering, rating, and reviewing movies and TV series. Users can explore content, leave star ratings, write reviews, and get personalized recommendations. Administrators can manage the content catalog and user accounts.

## Project Structure
```
Hidescorev3.1/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── contexts/
├── server/          # Express.js backend
│   ├── db.ts       # Database connection
│   ├── routes.ts   # API routes
│   ├── seed.ts     # Database seeding
│   └── storage.ts  # Database queries
├── shared/          # Shared TypeScript schemas
│   └── schema.ts   # Drizzle ORM schema
└── package.json
```

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter (lightweight React router)
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Validation**: Zod for schemas
- **Authentication**: Simple system with localStorage + HTTP headers

## Environment Variables
The `.env` file contains:
- `DATABASE_URL`: PostgreSQL connection string (automatically provided by Replit's built-in database)
- `SEED_DATABASE`: Set to `1` or `true` to enable automatic database seeding

**Security Note**: The `.env` file is in `.gitignore` and should never be committed to version control. Replit automatically provides the `DATABASE_URL` environment variable for the built-in PostgreSQL database.

## Development Setup

### Running the Development Server
The development server runs on port 5000 and includes:
- Vite dev server for hot-reload frontend
- Express backend with API routes
- WebSocket support for database (Neon)
- Automatic database seeding (when enabled)

Command: `npm run dev`

### Database
The database schema includes:
- **users**: User accounts with email, password, and rank
- **movies**: Movie catalog with ratings, genres, platforms
- **series**: TV series catalog with seasons, episodes
- **ratings**: User ratings and reviews for content
- **comments**: User comments on movies/series

Database is automatically seeded with sample data when `SEED_DATABASE=1` is set in `.env`.

## Deployment
The application is configured for Replit Autoscale deployment:
- **Build**: `npm run build` - Builds frontend (Vite) and backend (esbuild)
- **Start**: `npm run start` - Runs production server on port 5000

## Key Features
1. **Content Discovery**: Browse trending movies and series
2. **Search**: Find content by title
3. **Ratings & Reviews**: Star ratings (1-5) and text reviews
4. **User Profiles**: Track your ratings and reviews
5. **Admin Panel**: Manage movies, series, and users
6. **Responsive Design**: Works on desktop and mobile

## Recent Changes (Replit Setup)
- Fixed package.json dev script typo (`devloper` → `development`)
- Added `allowedHosts: true` to Vite config for Replit proxy support
- Created database tables using PostgreSQL
- Configured development workflow on port 5000
- Set up deployment configuration for production
- Removed exposed database credentials from `.env` file for security
- Configured to use Replit's built-in PostgreSQL database

## Notes
- The application uses Spanish language interface
- Database seeding creates sample movies and series automatically
- Frontend is configured to work with Replit's iframe proxy
- All static assets are served through Vite in development
