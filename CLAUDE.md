# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (frontend + backend on port 3001/5000)
- `npm run build` - Build for production (Vite + esbuild bundle)
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes with Drizzle

## Architecture Overview

This is a Universal Code Transpiler that converts code between frameworks using AST analysis and Universal Intermediate Representation (UIR). The system processes ZIP file uploads exclusively.

### Core Structure
- **Frontend**: React 18 + TypeScript + Vite in `client/` directory
- **Backend**: Express.js + TypeScript in `server/` directory  
- **Shared**: Database schema and types in `shared/schema.ts`
- **Database**: PostgreSQL with Drizzle ORM

### Key Services (server/services/)
- `language-detector.ts` - Identifies programming languages and frameworks
- `ast-parser.ts` - Converts source code to Abstract Syntax Trees
- `uir-generator.ts` - Transforms ASTs into Universal Intermediate Representation
- `transpiler.ts` - Converts UIR to target framework code
- `file-handler.ts` - Manages ZIP uploads and file processing

### Database Schema
- `projects` table tracks uploaded projects and conversion status
- `conversionJobs` table manages individual conversion tasks
- `supportedFrameworks` table defines available conversion targets

### File Processing Pipeline
1. ZIP upload → extraction with cache removal
2. Language detection with percentage analysis  
3. AST parsing for code structure
4. UIR generation as universal format
5. Framework-specific transpilation
6. Clean ZIP download of converted project

### UI Components
Uses shadcn/ui design system with components in `client/src/components/ui/`. Main conversion interface components:
- `upload-section.tsx` - File upload handling
- `conversion-panel.tsx` - Framework selection
- `conversion-progress.tsx` - Real-time progress tracking
- `analysis-results.tsx` - Language detection display

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Environment Requirements
- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (defaults to 3001)