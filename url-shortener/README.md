# URL Shortener

A full-stack URL shortener built with **Next.js** (App Router), **Tailwind CSS**, **Prisma**, and **SQLite**. Create short links, track clicks, and view all links in a responsive table.

## Features

- **Shorten URLs** – Enter a long URL and get a unique short code (e.g. `https://yoursite.com/abc123`).
- **Redirect & track** – Visiting a short URL redirects to the original and increments the click count.
- **List all links** – Table shows original URL, short link, click count, and creation date.
- **Copy short link** – One-click copy for each short URL.
- **Validation** – URL format validation and basic error handling.
- **Responsive UI** – Mobile-friendly layout with Tailwind CSS.

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Prisma** (ORM)
- **SQLite** (database)

## Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

## Setup

### 1. Install dependencies

```bash
cd url-shortener
npm install
```

### 2. Environment variables

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

- **SQLite**: Set `DATABASE_URL="file:./prisma/dev.db"` in `.env` (see `.env.example`). The path is relative to the project root.
- **Optional**: Set `NEXT_PUBLIC_APP_URL` if you need a fixed base URL for short links (e.g. in production behind a proxy).

### 3. Database

Ensure `DATABASE_URL` in `.env` points to SQLite (e.g. `file:./prisma/dev.db`). Then generate the Prisma client and create the database:

```bash
npx prisma generate
npx prisma db push
```

`db push` creates/updates the SQLite database and tables from `prisma/schema.prisma`. For production you may prefer migrations:

```bash
npx prisma migrate dev --name init
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
url-shortener/
├── app/
│   ├── api/urls/route.ts   # GET (list) & POST (create) short URLs
│   ├── [shortCode]/page.tsx # Redirect by short code & increment clicks
│   ├── not-found.tsx       # 404 for invalid short codes
│   ├── layout.tsx
│   ├── page.tsx            # Home: form + URL table
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── UrlForm.tsx         # Form to submit long URL
│   ├── UrlTable.tsx        # Table of all short URLs
│   └── UrlShortener.tsx    # Client wrapper (state + fetch)
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── short-code.ts       # Unique short code generation
│   └── validation.ts       # URL validation & normalization
├── prisma/
│   └── schema.prisma       # Url model (SQLite)
├── .env.example
└── README.md
```

## API

### `GET /api/urls`

Returns all shortened URLs (newest first).

**Response:** `Array<{ id, originalUrl, shortCode, clicks, createdAt }>`

### `POST /api/urls`

Creates a new short URL.

**Body:** `{ "url": "https://example.com" }`

**Validation:** URL must be a valid HTTP/HTTPS URL.

**Response:** `{ id, originalUrl, shortCode, clicks, createdAt }`

**Errors:** `400` for missing/invalid URL, `500` for server errors.

## Database schema (Prisma)

```prisma
model Url {
  id          Int      @id @default(autoincrement())
  originalUrl String
  shortCode   String   @unique
  clicks      Int      @default(0)
  createdAt   DateTime @default(now())
}
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npx prisma studio` – Open Prisma Studio to inspect/edit data

## License

MIT
