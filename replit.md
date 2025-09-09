# Gym Rat - AI-Powered Fitness Application

## Overview

Gym Rat is a comprehensive fitness tracking application that combines workout monitoring, nutrition tracking, and progress analytics. The application leverages AI-powered nutrition analysis through OpenAI integration and provides personalized fitness recommendations based on user profiles and BMR calculations. Built as a full-stack web application, it features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Replit Auth for user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application is built using React 18 with TypeScript, implementing a modern component-based architecture:

- **UI Framework**: Utilizes shadcn/ui component library built on Radix UI primitives for consistent, accessible design components
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for type-safe form validation
- **Build System**: Vite for fast development and optimized production builds

The application follows a component-based structure with shared UI components, page-level components, and custom hooks for business logic.

### Backend Architecture

The server-side application uses Node.js with Express.js in a RESTful API design:

- **Framework**: Express.js with TypeScript for type safety
- **Authentication**: Replit Auth with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Business Logic**: Separated into service layers for BMR calculations and OpenAI integrations

### Data Storage Solutions

The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Database**: PostgreSQL hosted on Neon for scalable cloud database management
- **ORM**: Drizzle ORM provides type-safe database queries and schema management
- **Schema Design**: Relational database design with proper foreign key constraints
- **Tables**: Users, user profiles, food entries, exercises, workout sessions, workout exercises, progress entries, and session storage

### Authentication and Authorization

The authentication system is built around Replit Auth:

- **Provider**: Replit OpenID Connect (OIDC) for secure authentication
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Middleware**: Express middleware for route protection and user context
- **Security**: HTTPS-only cookies, CSRF protection, and secure session handling

### External Service Integrations

The application integrates with several external services:

- **OpenAI API**: GPT models for intelligent food nutrition analysis and meal plan generation
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Replit Services**: Authentication, development environment, and deployment platform

### Key Features and Services

**Nutrition Tracking**:
- AI-powered food analysis using OpenAI's GPT models
- Automatic nutritional information extraction from food descriptions
- Personalized meal plan generation based on user goals and preferences

**Workout Management**:
- Comprehensive exercise database with categorization
- Workout session tracking with exercise sets, reps, and weights
- Timer functionality for workout sessions

**Progress Analytics**:
- BMR calculation using Harris-Benedict equation
- Body composition tracking (weight, body fat, muscle mass)
- Visual progress charts and statistics

**User Profile Management**:
- Comprehensive user profiling with fitness goals
- Activity level assessment for caloric need calculations
- Personalized nutrition and fitness recommendations

The architecture emphasizes type safety throughout the stack, from database schemas to API responses, ensuring reliable data flow and reduced runtime errors.

## External Dependencies

- **Neon Database**: Serverless PostgreSQL database with connection pooling and WebSocket support
- **OpenAI API**: GPT models for natural language processing of nutrition data and meal planning
- **Replit Auth**: OpenID Connect authentication provider for secure user login
- **shadcn/ui**: React component library built on Radix UI primitives
- **TanStack React Query**: Data fetching and caching library for React applications
- **Drizzle ORM**: TypeScript ORM for PostgreSQL with schema generation and migrations
- **Tailwind CSS**: Utility-first CSS framework for responsive design