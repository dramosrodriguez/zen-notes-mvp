# Project: Zen Notes MVP

Zen Notes MVP is a Next.js 16-based application designed for note-taking. It leverages Supabase for backend services, Tiptap for rich text editing, and Tailwind CSS 4 for styling.

## Project Overview

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **Database/Backend:** Supabase
- **Editor:** Tiptap (Starter Kit, Text Style, Color extensions)
- **UI Components:** shadcn/ui
- **PWA Support:** Serwist

## Building and Running

Ensure you have your dependencies installed:
```bash
npm install
```

### Development
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building
Build the project for production:
```bash
npm run build
```

### Linting
Run the linter:
```bash
npm run lint
```

## Development Conventions

- **Directory Structure:**
  - `src/app/`: Next.js App Router files.
  - `src/components/`: React components, grouped by domain (e.g., `editor`, `sidebar`, `ui`).
  - `src/lib/`: Shared utility functions and Supabase configuration.
  - `src/hooks/`: Custom React hooks.
- **Styling:** Utilize Tailwind CSS 4 utility classes directly in components.
- **Components:** Components under `src/components/ui/` are standard shadcn-style components.
- **State Management:** Uses React hooks.
