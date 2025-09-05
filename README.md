# Grant Flow - Research Grant Management System

A comprehensive research grant management platform built with React, TypeScript, Express.js, and Supabase.

## 🚀 Features

- **Grant Call Management**: Create and manage funding opportunities
- **Proposal Submission**: Multi-step proposal wizard with team and budget management
- **Review System**: Structured peer review with scoring rubrics
- **Award Tracking**: Monitor awarded projects and milestones
- **Role-Based Access**: Secure permissions for different user types
- **Dashboard & Analytics**: Comprehensive reporting and metrics

## 🛠️ Tech Stack

### Frontend

- React 18 with TypeScript
- Wouter for routing
- TanStack Query for state management
- Tailwind CSS + shadcn/ui for styling
- React Hook Form with Zod validation

### Backend

- Express.js with TypeScript
- Drizzle ORM for database operations
- Supabase for authentication and PostgreSQL database
- File upload with Multer
- Session management

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd grant-flow
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > Database and copy your connection string
3. Go to Settings > API and copy your URL and keys

### 3. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]

# Supabase Configuration
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Client-side Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# Session Configuration (generate a random 32+ character string)
SESSION_SECRET=your-secure-session-secret-minimum-32-characters

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Run database migrations
npm run db:push

# Optional: Add initial test data
# Edit setup.sql with real user IDs, then run in Supabase SQL editor
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── main.tsx        # Entry point
├── server/                 # Express backend
│   ├── db.ts              # Database configuration
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API routes
│   ├── supabaseAuth.ts    # Authentication middleware
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── uploads/               # File upload directory
```

## 🔐 Authentication

The system uses Supabase Auth with session-based authentication:

- **Sign Up/Sign In**: Users can create accounts and sign in
- **Role-Based Access**: Different permissions for researchers, reviewers, grant managers, etc.
- **Session Management**: Secure server-side sessions with automatic token refresh

## 📊 Database Schema

The system includes comprehensive tables for:

- **Users & Roles**: User management with role-based permissions
- **Grant Calls**: Funding opportunity management
- **Proposals**: Research proposal submissions
- **Reviews**: Peer review system with scoring
- **Awards**: Funding award tracking
- **Budget Management**: Detailed budget planning
- **File Attachments**: Document upload and management
- **Audit Logs**: Complete activity tracking

## 🎯 User Roles

- **Super Admin**: Full system access
- **Grant Manager**: Manage calls, reviews, and awards
- **Researcher**: Submit proposals and manage projects
- **Reviewer**: Review and score proposals
- **Finance Officer**: Budget and financial oversight
- **Ethics Officer**: Ethics review and approval
- **Auditor**: Read-only access for compliance

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user

### Grant Calls

- `GET /api/calls` - List grant calls
- `POST /api/calls` - Create grant call
- `GET /api/calls/:id` - Get specific call

### Proposals

- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `POST /api/proposals/:id/submit` - Submit proposal

### Reviews

- `GET /api/proposals/:id/reviews` - Get proposal reviews
- `POST /api/proposals/:id/reviews` - Create review

### Awards

- `GET /api/awards` - List awards

## 🚀 Deployment

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

```env
NODE_ENV=production
DATABASE_URL=[production-database-url]
SUPABASE_URL=[production-supabase-url]
SUPABASE_SERVICE_ROLE_KEY=[production-service-role-key]
VITE_SUPABASE_URL=[production-supabase-url]
VITE_SUPABASE_ANON_KEY=[production-anon-key]
SESSION_SECRET=[secure-production-secret]
PORT=5000
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Development

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts` and run `npm run db:push`
2. **API Endpoints**: Add routes in `server/routes.ts`
3. **Frontend Pages**: Create components in `client/src/pages/`
4. **UI Components**: Use shadcn/ui components in `client/src/components/ui/`

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Drizzle for type-safe database queries
- Zod for runtime validation

## 📝 Environment Variables Reference

| Variable                    | Description                                   | Required |
| --------------------------- | --------------------------------------------- | -------- |
| `DATABASE_URL`              | PostgreSQL connection string from Supabase    | Yes      |
| `SUPABASE_URL`              | Supabase project URL                          | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                     | Yes      |
| `VITE_SUPABASE_URL`         | Supabase URL for client-side                  | Yes      |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anonymous key for client-side        | Yes      |
| `SESSION_SECRET`            | Secret key for session encryption (32+ chars) | Yes      |
| `PORT`                      | Server port (default: 5000)                   | No       |
| `NODE_ENV`                  | Environment (development/production)          | No       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include environment details and error messages

---

Built with ❤️ for the research community
