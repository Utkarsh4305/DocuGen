# Universal Code Transpiler

## Overview

A comprehensive full-stack application that enables cross-framework code transpilation through AST analysis and Universal Intermediate Representation (UIR). The system exclusively accepts ZIP file uploads, automatically removes cache files for lightweight analysis, detects tech stacks with percentage distribution, and performs bidirectional code conversion between popular frameworks including React, Flutter, Kotlin, SwiftUI, Node.js, Python, and Go. Built with a TypeScript/React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application uses React with TypeScript, built on Vite for development and bundling. The UI leverages shadcn/ui components with Radix UI primitives for consistent, accessible design patterns. State management is handled through TanStack Query for server state and React hooks for local state. The frontend follows a component-based architecture with clear separation between presentation components, business logic, and data fetching.

### Backend Architecture
The server implements a REST API using Express.js with TypeScript, following a service-oriented architecture. Core services include:
- **Language Detection Service**: Analyzes uploaded files to identify programming languages and frameworks
- **AST Parser Service**: Converts source code into Abstract Syntax Trees for multiple languages
- **UIR Generator Service**: Transforms ASTs into a Universal Intermediate Representation for cross-framework compatibility
- **Transpiler Service**: Handles the conversion between different frameworks using the UIR as an intermediary

The API supports file uploads via multer with validation for supported file types and size limits.

### Data Storage Architecture
PostgreSQL database with Drizzle ORM manages three core entities:
- **Projects**: Store uploaded project metadata, files, AST data, UIR representation, and conversion status
- **Conversion Jobs**: Track individual transpilation tasks with progress monitoring and result storage
- **Supported Frameworks**: Maintain framework definitions, conversion rules, and bidirectional support mappings

The schema supports JSON storage for complex data structures like file contents, AST trees, and conversion results.

### Universal Intermediate Representation (UIR)
The system employs a custom UIR format that abstracts common programming concepts across frameworks:
- Component definitions with props, state, and lifecycle methods
- Function and class declarations with parameter mapping
- Import/export relationships and dependency tracking
- UI element hierarchies with cross-platform compatibility markers

This approach enables accurate translation while preserving application logic and structure.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and functional components
- **Express.js**: Backend web server and API framework
- **Drizzle ORM**: Type-safe PostgreSQL database toolkit
- **PostgreSQL**: Primary database via Neon serverless
- **TypeScript**: Static typing across the entire stack

### Development and Build Tools
- **Vite**: Frontend build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Babel**: JavaScript/TypeScript parsing and transformation
- **ESBuild**: Fast JavaScript bundler for production builds

### UI and Component Libraries
- **shadcn/ui**: Pre-built component collection
- **Radix UI**: Headless UI component primitives
- **Recharts**: Charting library for data visualization
- **Lucide React**: Icon library

### File Processing and Analysis
- **Multer**: File upload middleware
- **Babel Parser**: AST generation for JavaScript/TypeScript
- **Language Detection**: Custom service for framework identification

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition

The architecture prioritizes extensibility for adding new framework conversions while maintaining type safety and performance through careful separation of concerns and modular design patterns.

## Recent Updates (January 2025)

✓ **ZIP-Only Upload System**: Modified the application to exclusively accept ZIP file uploads (max 100MB)
✓ **Automatic Cache Removal**: Implemented comprehensive cache file filtering to remove node_modules, .git, build folders, temporary files, and other unnecessary files for lighter, faster analysis
✓ **Enhanced File Processing**: Updated yauzl-based ZIP extraction with intelligent file filtering and binary file handling
✓ **Updated API Endpoints**: Added dedicated /api/projects/upload-zip endpoint with proper multipart/form-data handling
✓ **Improved Error Handling**: Enhanced TypeScript error handling across routes and file processing modules
✓ **Language Purpose Detection**: Enhanced language analysis to detect specific purposes (Backend, Frontend, Data Science, etc.)
✓ **Direct Conversion API**: Added `/api/projects/:id/convert` endpoint that returns clean ZIP files directly
✓ **Simple Converter Component**: Created streamlined conversion interface with automatic cache removal and clean output
✓ **Replit Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment with full functionality