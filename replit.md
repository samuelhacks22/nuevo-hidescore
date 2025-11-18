# HideScore v3.1 - Replit Project Documentation

## Overview
HideScore is a full-stack web application for discovering, rating, and reviewing movies and series. Users can explore content, leave star ratings, write reviews, and get recommendations. Administrators can manage the content catalog and users.

## Project Information
- **Project Type**: Full-Stack Web Application
- **Framework**: React 18 + TypeScript + Express.js
- **Database**: PostgreSQL (Neon serverless)
- **Build Tool**: Vite
- **ORM**: Drizzle ORM
- **Port**: 5000 (unified server for both frontend and API)

## Recent Changes
- **2024-11-18**: Initial Replit setup completed
  - Configured Vite to run on port 5000 (changed from 5173)
  - Fixed WebSocket configuration for Neon database connectivity
  - Configured deployment settings for Replit autoscale
  - Database migrations applied successfully
  - Sample data seeded to database

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter (lightweight React router)
- **Authentication**: Simple localStorage-based system with bcrypt password hashing

### Project Structure
```
Hidescorev3.1/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── pages/       # Main pages (HomePage, MoviesPage, etc.)
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities (queryClient, apiRequest)
│   └── index.html       # HTML entry point
├── server/              # Backend Express application
│   ├── app.ts           # Express app configuration
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations
│   ├── db.ts            # Database connection setup
│   ├── seed.ts          # Database seeding logic
│   ├── vite.ts          # Vite dev server integration
│   └── index.ts         # Server entry point
├── shared/              # Shared code between client and server
│   └── schema.ts        # Drizzle schema and Zod validation
└── scripts/             # Utility scripts
```

## User Preferences

### Authentication & User Roles
- **Public Users**: Can browse movies/series, view ratings and comments
- **Registered Users**: Can rate content (0-5 stars), write reviews, and leave comments
- **Administrators**: Full CRUD access to movies, series, and users via admin panel

### Key Features
1. **Content Discovery**: Browse movies and series with advanced filtering
2. **Rating System**: Star ratings (0-5) with optional text reviews
3. **Comments**: Discussion threads for each movie/series
4. **Recommendations**: Personalized content suggestions
5. **Platform Links**: Direct links to streaming platforms (Netflix, HBO, etc.)
6. **Admin Panel**: Content and user management interface

## Database Schema

### Main Tables
- `users`: User accounts with email, display name, password hash, and rank
- `movies`: Movie catalog with metadata, ratings, and platform links
- `series`: TV series catalog with seasons, episodes, and metadata
- `ratings`: User ratings for movies/series (0-5 stars + review text)
- `comments`: User comments on movies/series

### Key Features
- Automatic rating aggregation (averageRating, ratingCount)
- Platform links array for streaming services
- Genre and cast as PostgreSQL arrays
- Cascade deletes for data integrity

## Development

### Environment Variables
Required in `.env` file (located in `Hidescorev3.1/` directory):
- `DATABASE_URL`: PostgreSQL connection string (Neon database)
- `SEED_DATABASE`: Set to `1` or `true` to enable automatic seeding in development

### Available Commands
```bash
cd Hidescorev3.1

# Development server (runs on port 5000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:push

# TypeScript type checking
npm run check
```

### Development Workflow
1. The application runs on a unified server at port 5000
2. Express handles API routes (`/api/*`)
3. Vite middleware serves the React frontend in development
4. Hot Module Replacement (HMR) is enabled for fast development
5. Database seeding runs automatically when `SEED_DATABASE=1`

## Deployment

### Replit Deployment Settings
- **Type**: Autoscale (serverless, scales with traffic)
- **Build Command**: `cd Hidescorev3.1 && npm run build`
- **Run Command**: `cd Hidescorev3.1 && npm start`
- **Port**: 5000 (exposed to the internet)

### Production Configuration
- Static files are served from `dist/` directory
- Backend API compiled to `dist/server/`
- Database connection uses WebSocket for non-Vercel environments
- Environment variables must be set in Replit Secrets

## API Endpoints

### Public Endpoints
- `GET /api/movies` - List all movies (with filters)
- `GET /api/movies/trending` - Top 12 trending movies
- `GET /api/movies/:id` - Movie details
- `GET /api/series` - List all series
- `GET /api/series/trending` - Top 12 trending series
- `GET /api/series/:id` - Series details

### Authenticated Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/ratings` - Create rating
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating
- `POST /api/comments` - Create comment

### Admin Endpoints
- `GET /api/admin/stats` - Platform statistics
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie
- Similar endpoints for series and users

## Configuration Notes

### Vite Configuration
- Port set to 5000 for Replit compatibility
- Host set to `0.0.0.0` to allow external access
- `allowedHosts: true` configured in server setup
- HMR client port set to 443 for Replit proxy

### Database Configuration
- Neon PostgreSQL with WebSocket support
- Connection pooling enabled
- SSL mode required for Neon connections
- Automatic connection retry logic

### Security
- Passwords hashed with bcrypt
- User authentication via localStorage and x-user-id header
- Admin routes protected by rank verification
- SQL injection prevention via Drizzle ORM parameterized queries

## Troubleshooting

### Common Issues
1. **Database Connection Errors**: Ensure DATABASE_URL is set correctly in .env
2. **Port Conflicts**: Application requires port 5000 to be available
3. **WebSocket Errors**: The `ws` package must be installed for Neon connectivity
4. **Build Failures**: Run `npm run check` to verify TypeScript errors

### Logs
- Server logs show `[DB]`, `[API]`, and `[express]` prefixed messages
- Database operations are logged with connection status
- API requests are logged with method, path, status, and duration

## Future Improvements
- Implement JWT-based authentication for better security
- Add pagination for large content lists
- Implement full-text search with PostgreSQL
- Add image upload for movie/series posters
- Enhance recommendation algorithm with AI integration
- Add rate limiting for API endpoints

## Notes
- This is a monorepo structure with all code in the `Hidescorev3.1/` directory
- The application uses a unified server approach (Express + Vite)
- Seeding is optional and controlled by environment variable
- The database is hosted externally on Neon (serverless PostgreSQL)
