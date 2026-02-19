# ViewDex

A media tracking web application for tracking your anime, manga, manhwa, and donghua progress. Never lose track of where you left off.

## Features

- **Track Progress** - Keep track of episodes and chapters with a simple +1 button
- **Watch & Read** - Support for anime, donghua, manga, manhwa, and more
- **Rate & Review** - Rate your favorites (1-10) and add personal notes
- **Mobile Ready** - PWA support, installable on your phone
- **Dark/Light Mode** - Theme toggle with system preference support
- **User Authentication** - Email/password and Google OAuth
- **Admin Dashboard** - View all users and stats (admin only)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query
- **PWA**: @ducanh2912/next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/viewdex.git
   cd viewdex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials.

4. Push database schema:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy

### Supabase Setup

1. Create a new Supabase project
2. Go to Authentication → Providers → Email to configure email settings
3. Copy connection strings and API keys to environment variables
4. Add your production URL to Authentication → URL Configuration

## License

MIT
