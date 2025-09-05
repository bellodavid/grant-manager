# Research Grant Management Application (RGMA)

## Overview

RGMA is a comprehensive web application designed for academic institutions to manage their entire research grant lifecycle. The system facilitates grant call creation and management, proposal submission and review processes, award tracking, and financial monitoring. Built with a modern full-stack architecture, it serves researchers, administrators, reviewers, and finance officers with role-based access controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling (shadcn/ui design system)
- **Styling**: Tailwind CSS with CSS variables for theming support

The frontend follows a component-based architecture with clear separation of concerns:
- Pages handle route-level logic and authentication checks
- Reusable UI components provide consistent design patterns
- Custom hooks manage authentication state and API interactions
- Forms use a multi-step wizard pattern for complex data entry

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Custom OpenID Connect integration with Replit's authentication system
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer middleware for document attachment handling
- **API Design**: RESTful endpoints with consistent error handling and logging

The backend implements a layered architecture:
- Route handlers manage HTTP requests and responses
- Storage layer abstracts database operations
- Authentication middleware enforces access controls
- Role-based permissions system supports multiple user types

### Data Storage Solutions

**Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Connection Pooling**: Connection pooling for efficient database resource usage
- **Session Storage**: PostgreSQL-backed session storage for authentication persistence

The database schema supports complex grant management workflows:
- User management with role-based access control
- Grant calls with configurable criteria and deadlines
- Proposals with team member associations and budget breakdowns
- Review workflows with assignment and scoring systems
- Award tracking with milestone and disbursement management

### Authentication and Authorization

**Authentication Provider**: Replit's OpenID Connect service
- **Session Management**: Server-side sessions with secure cookie storage
- **Role System**: Enum-based roles (super_admin, grant_manager, researcher, reviewer, finance_officer, ethics_officer, auditor)
- **Access Control**: Route-level authentication middleware with role checking
- **Token Management**: Automatic token refresh and session validation

The system implements comprehensive security measures:
- HTTPS-only session cookies with proper security flags
- CSRF protection through session-based authentication
- Input validation and sanitization at all API endpoints
- Audit logging for sensitive operations

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OpenID Connect service
- **File Storage**: Local file system with multer for development (uploads directory)
- **Build Tools**: Vite for frontend bundling and development server

### Development and Deployment
- **Package Management**: npm with lockfile for reproducible builds
- **TypeScript**: Full-stack type safety with shared schema definitions
- **Development Environment**: Replit-specific tooling and banner integration
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

### UI and Visualization
- **Component Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography  
- **Fonts**: Google Fonts integration (DM Sans, Architects Daughter, Fira Code, Geist Mono)
- **Styling**: Tailwind CSS with custom color palette and design tokens

The application leverages modern web standards and practices while maintaining compatibility with Replit's hosting environment. The architecture supports horizontal scaling and can be adapted for different deployment targets with minimal configuration changes.