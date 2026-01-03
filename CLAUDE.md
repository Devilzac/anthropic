# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It allows users to describe React components in natural language, generates them using Claude AI, and displays them in a real-time preview environment. The project uses a virtual file system (no files written to disk) and supports both authenticated users and anonymous sessions.

## Common Commands

### Development
```bash
npm run dev              # Start Next.js dev server with Turbopack
npm run dev:daemon       # Start dev server in background, logs to logs.txt
npm run build            # Build for production
npm run start            # Start production server
```

### Testing
```bash
npm test                 # Run all Vitest tests
```

### Database
```bash
npm run setup            # Install deps, generate Prisma client, run migrations
npm run db:reset         # Reset database and run migrations
npx prisma migrate dev   # Create and apply new migration
npx prisma generate      # Regenerate Prisma client
```

### Linting
```bash
npm run lint             # Run ESLint
```

## Architecture

### Core System: Virtual File System + AI Tools

The application's centerpiece is a **VirtualFileSystem** (`src/lib/file-system.ts`) that maintains files entirely in memory. The AI interacts with this file system through two custom tools:

1. **str_replace_editor** (`src/lib/tools/str-replace.ts`): Create files, view files, replace strings, insert text
2. **file_manager** (`src/lib/tools/file-manager.ts`): Rename/move and delete files

These tools are provided to the AI through the Vercel AI SDK's `streamText` function in the chat API route.

### AI Integration Flow

1. **Chat API** (`src/app/api/chat/route.ts`):
   - Receives messages and current file system state from client
   - Deserializes the virtual file system from JSON
   - Calls `streamText` with the system prompt (`src/lib/prompts/generation.tsx`) and the two tools
   - On completion, saves conversation history and file system state to database (for authenticated users)

2. **Language Model Provider** (`src/lib/provider.ts`):
   - If `ANTHROPIC_API_KEY` is present: uses Claude Haiku 4.5 via `@ai-sdk/anthropic`
   - If no API key: uses `MockLanguageModel` which returns static component code
   - Mock provider is useful for development/demo without API costs

### Client-Side Preview System

**JSX Transformation** (`src/lib/transform/jsx-transformer.ts`):
- Transforms JSX/TSX files using Babel standalone in the browser
- Creates blob URLs for transformed modules
- Generates ES Module import maps mapping paths to blob URLs
- Handles `@/` path alias (resolves to root `/`)
- Loads third-party packages from `esm.sh` (e.g., React from `https://esm.sh/react@19`)
- Collects and injects CSS file contents inline
- Generates complete HTML preview with Tailwind CDN, error boundaries, and import maps

**Preview Flow**:
1. Files from virtual file system are transformed to ES modules
2. Import map created with blob URLs + external CDN packages
3. HTML document generated with import map and entry point (`/App.jsx`)
4. Preview iframe loads this HTML to render the component

### State Management

**Client-Side Contexts**:
- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): Manages virtual file system state on client, serializes/deserializes to JSON for API calls
- **ChatContext** (`src/lib/contexts/chat-context.tsx`): Manages chat messages and streaming state using Vercel AI SDK's `useChat` hook

### Authentication & Persistence

**Authentication** (`src/lib/auth.ts`):
- JWT-based sessions using `jose` library
- Sessions stored in HTTP-only cookies (7-day expiration)
- Anonymous users can use the app without authentication

**Database** (Prisma + SQLite):
- `User`: Stores email and hashed password (bcrypt)
- `Project`: Stores project name, messages (JSON), and file system data (JSON)
- Prisma client generated to `src/generated/prisma/` (not default location)
- Projects can be null userId (anonymous) or associated with authenticated user

**Anonymous Work Tracking** (`src/lib/anon-work-tracker.ts`):
- Tracks anonymous user activity to prevent data persistence
- Uses localStorage to maintain session for anonymous users

### UI Component Structure

- **Next.js 15** with App Router (React Server Components by default)
- **Tailwind CSS v4** with PostCSS
- **shadcn/ui** components in `src/components/ui/`
- **Monaco Editor** for code viewing/editing
- **React Resizable Panels** for layout
- **Chat Interface** handles streaming AI responses and renders markdown

## Key Development Notes

### Entry Point Requirements
- Every project MUST have `/App.jsx` as the root component
- `App.jsx` must export a React component as default export
- This is enforced by the system prompt given to the AI

### Path Aliasing
- All imports use `@/` prefix for local files (e.g., `import Foo from '@/components/Foo'`)
- This is configured in `tsconfig.json` and handled by the import map generator
- The virtual file system uses absolute paths starting with `/`

### Styling
- Components use Tailwind CSS classes (CDN loaded in preview)
- No inline styles or CSS-in-JS (except through Tailwind)
- CSS files are collected and injected into preview HTML

### Testing
- Vitest with jsdom environment
- React Testing Library for component tests
- Tests colocated in `__tests__` directories next to source files

### Database Schema Changes
When modifying `prisma/schema.prisma`:
1. Run `npx prisma migrate dev --name description_of_change`
2. Run `npx prisma generate` to update client types
3. Commit both the schema and migration files

### Working with File System
The virtual file system (`VirtualFileSystem` class):
- Normalizes all paths (adds leading `/`, removes trailing `/`)
- Creates parent directories automatically when creating files
- Uses `Map<string, FileNode>` internally for fast lookups
- Serializes to plain objects for JSON transfer (Maps don't serialize)
- Supports rename/move operations with recursive path updates for directories
- Use comments sparingly. only comment complex code.
- The database schema is defined in the @prisma\schema.prisma file. Please reference it anytime you need to understand the structure of data stored in the database.