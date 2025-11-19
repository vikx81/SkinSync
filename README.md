# SkinSync

A full-stack skincare routine tracking application built with React, TypeScript, and Supabase.

## Features

- **Product Library**: Add, edit, and retire skincare products with full history tracking
- **Routine Tracker**: Log AM/PM routines with product selection, notes, and photos
- **Treatment Tracking**: Track professional treatments with retinol buffer logic
- **Log History**: View historical logs with calendar and list views
- **Progress Photos**: Compare photos side-by-side to track skin progress
- **Dark Mode**: Toggle between light and dark themes
- **Export**: Download data as CSV or PDF reports

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd SkinSync
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase/schema.sql`
3. Create a storage bucket named `photos` with public access
4. Copy your project URL and anon key from Project Settings > API

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

### Tables

- **products**: Skincare products with status (active/retired)
- **routines**: AM/PM routine logs with products and photos
- **treatments**: Professional treatment records with buffer days
- **photos**: Progress photos for comparison
- **user_settings**: User preferences (dark mode, notifications)

### Key Features

- Row Level Security (RLS) enabled for all tables
- Automatic timestamps and user settings creation
- Treatment buffer logic for retinol restrictions

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks for data fetching
├── lib/            # Supabase client configuration
├── pages/          # Main app pages
├── store/          # Zustand state management
└── types/          # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Sign Up/Sign In**: Create an account or sign in
2. **Add Products**: Go to Products tab and add your skincare products
3. **Log Routine**: Select AM or PM and check the products you used
4. **Track Treatments**: Log professional treatments - retinol products will be automatically hidden during buffer periods
5. **View History**: Check your routine and treatment history
6. **Compare Progress**: Use photo comparison in Profile to see your skin's progress

## Buffer Logic

When you log a treatment (like IPL, Microneedling, etc.), retinol products are automatically hidden from routine selection for the specified buffer period (default 7 days before and after). This helps prevent skin irritation and complications.

## License

MIT
