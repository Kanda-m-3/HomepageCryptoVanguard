# Crypto Vanguard - Replit.md

## Overview

Crypto Vanguard is a Japanese cryptocurrency community platform that provides market analysis, educational content, and premium services. The application features a dual-tier community system with free Discord access and premium VIP memberships, along with analytical reports for purchase.

## System Architecture

This is a full-stack web application built with a modern TypeScript stack:

**Frontend**: React with Vite, TypeScript, TailwindCSS, and shadcn/ui components
**Backend**: Express.js server with TypeScript
**Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
**Payment Processing**: Stripe integration for report purchases and subscriptions
**Deployment**: Replit with autoscale deployment target

The application follows a monorepo structure with shared schemas and clear separation between client and server code.

## Key Components

### Frontend Architecture
- **React Router**: Uses wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: TailwindCSS with custom crypto-themed color palette
- **Payment UI**: Stripe React components for checkout flows

### Backend Architecture
- **API Server**: Express.js with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **External APIs**: CoinGecko integration for real-time crypto prices
- **Payment Processing**: Stripe webhook handling and payment intent management

### Database Schema
Three main entities:
- **Users**: Authentication and Stripe customer management
- **Analytical Reports**: Content management for purchasable reports
- **Purchases**: Transaction records linking users to purchased content

### Authentication Strategy
The application is prepared for user authentication with Stripe customer integration, using a full PostgreSQL database implementation through Drizzle ORM for persistent data storage.

## Data Flow

1. **User Registration/Login**: Users create accounts linked to Stripe customers
2. **Content Discovery**: Browse free Discord content or premium VIP offerings
3. **Report Browsing**: View available analytical reports with free samples
4. **Purchase Flow**: Stripe payment processing with secure checkout
5. **Content Access**: Authenticated access to purchased reports and premium content

## External Dependencies

- **CoinGecko API**: Real-time cryptocurrency price data
- **Stripe**: Payment processing and subscription management
- **Neon Database**: PostgreSQL hosting (configured for Drizzle)
- **Discord**: Community platform integration
- **Replit**: Development and deployment environment

## Deployment Strategy

The application is configured for Replit's autoscale deployment:
- **Development**: `npm run dev` with hot reloading via Vite
- **Build Process**: Vite builds frontend, esbuild bundles server
- **Production**: Serves static assets and API from single Express server
- **Port Configuration**: External port 80 maps to internal port 5000

The deployment includes PostgreSQL module for database connectivity and is optimized for the Replit environment with proper asset handling and development tools.

## Changelog

## Recent Changes
- June 24, 2025: Initial setup completed
- June 24, 2025: Replaced hero section background with brighter crypto trading image
- June 24, 2025: Migrated from memory storage to PostgreSQL database implementation
- June 24, 2025: Sample analytical reports populated in database

## User Preferences

Preferred communication style: Simple, everyday language.