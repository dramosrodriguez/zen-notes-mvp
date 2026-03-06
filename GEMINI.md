# Zen Notes MVP

Zen Notes is a minimalist, local-first markdown note-taking application. 

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org) 16.1.6 (App Router)
- **Language:** TypeScript
- **Database/Auth:** [Supabase](https://supabase.com)
- **Styling:** Tailwind CSS 4
- **Editor:** Tiptap (Starter Kit, Text Style, Color extensions)
- **Icons:** Lucide React
- **PWA:** Serwist (Service Workers)
- **UI Components:** Radix UI

## Building and Running
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`

## Project Structure
- `src/app/`: Next.js App Router routes and global layout.
- `src/components/`: Reusable React components including the editor and sidebar.
- `src/lib/`: Core utilities including Supabase client initialization.
- `src/hooks/`: Custom hooks like `useBackup`.
- `public/`: Static assets and PWA configuration files.

## Development Conventions
- Use `shadcn` for UI component management.
- Follow the App Router structure for routing.
- Maintain environment variables in `.env` for Supabase configuration.
- Use Tailwind CSS 4+ utility classes for styling.
