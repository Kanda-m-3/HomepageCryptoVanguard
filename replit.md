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
The application features a robust Discord OAuth2 authentication system with:
- **Cross-Environment Support**: Automatic redirect URI generation for development, preview, and production environments
- **Session Management**: Express session middleware with PostgreSQL session storage
- **Discord Integration**: Server membership verification and user data synchronization
- **Multi-Environment OAuth**: Dynamic redirect URI detection and validation across Replit environments

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
- **Discord OAuth2**: Community platform integration with cross-environment support
- **Replit**: Development and deployment environment with auto-scaling capabilities

## Cross-Environment OAuth2 System

### Features Implemented
- **Environment Auto-Detection**: Automatic detection of development, preview, and production environments
- **Dynamic Redirect URI Generation**: Context-aware OAuth redirect URI creation
- **Multi-Environment Validation**: Request-based redirect URI validation and security checks
- **Setup Guide Generation**: Automated Discord Developer Portal configuration instructions
- **Debug Tools**: Developer endpoints for OAuth configuration testing and validation

### API Endpoints
- `GET /api/auth/discord/config` - Current environment OAuth configuration
- `GET /api/auth/discord/setup-guide` - Complete setup instructions for Discord Developer Portal
- `GET /oauth-setup` - Interactive setup guide UI
- `GET /cross-env-demo` - Cross-environment demonstration and testing interface

## Deployment Strategy

The application is configured for Replit's autoscale deployment:
- **Development**: `npm run dev` with hot reloading via Vite
- **Build Process**: Vite builds frontend, esbuild bundles server
- **Production**: Serves static assets and API from single Express server
- **Port Configuration**: External port 80 maps to internal port 5000

The deployment includes PostgreSQL module for database connectivity and is optimized for the Replit environment with proper asset handling and development tools.

## Changelog

## Recent Changes  
- January 8, 2025: ✅ Implemented complete VIP membership system with Stripe subscriptions
- January 8, 2025: ✅ Added VIP Member dashboard page with subscription management
- January 8, 2025: ✅ Created Stripe webhook integration for subscription lifecycle management
- January 8, 2025: ✅ Updated database schema with subscription tracking fields
- January 8, 2025: ✅ Integrated VIP registration flow with checkout session creation
- January 7, 2025: ✅ Implemented Cross-Environment OAuth2 Redirect URI Generator
- January 7, 2025: ✅ Created comprehensive OAuth setup guide and demo pages
- January 7, 2025: ✅ Successfully completed Discord OAuth2 authentication system with full session management
- January 7, 2025: Fixed Discord OAuth2 redirect URI configuration for Replit environment  
- January 7, 2025: Implemented Express session middleware for persistent user authentication
- January 7, 2025: Updated Discord server ID to correct value (1357437337537220719) for "Crypto Vanguard" server
- January 7, 2025: Added Discord user fields to database schema (discord_id, discord_username, discord_avatar, is_server_member, is_vip_member)
- January 7, 2025: Created Discord server join flow for non-members with invite code EP4dss5rB9
- January 7, 2025: Updated VIP membership benefits to focus on Discord channels, reports, and security features
- July 1, 2025: Enhanced crypto price ticker with all 10 tokens and smooth endless scrolling animation
- July 1, 2025: Updated Discord server invitation URL to https://discord.gg/EP4dss5rB9
- July 1, 2025: Created complete Terms of Service page with Japanese legal content
- July 1, 2025: Created comprehensive Privacy Policy page with Japanese legal content
- July 1, 2025: Removed Premium Signals link from footer navigation
- June 24, 2025: Initial setup completed
- June 24, 2025: Replaced hero section background with brighter crypto trading image
- June 24, 2025: Migrated from memory storage to PostgreSQL database implementation
- June 24, 2025: Sample analytical reports populated in database

## User Preferences

Preferred communication style: Simple, everyday language.