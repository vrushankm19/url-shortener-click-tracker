# URL Shortener — Technical Documentation

This document explains the URL Shortener application in a structured way suitable for technical review.

---

## 1. Project Overview

The **URL Shortener** is a full-stack web application that:

- **Shortens long URLs** — Users submit a long URL and receive a unique short link (e.g. `https://yoursite.com/abc123`).
- **Redirects visitors** — When someone opens a short link, they are sent to the original URL.
- **Tracks clicks** — Each redirect increments a click counter stored in the database.
- **Lists all links** — The main page shows a table of every shortened URL with original link, short link, click count, and creation date.

The app is built as a single Next.js project with a REST-style API, server-side redirects, and a responsive client UI.

---

## 2. Tech Stack

| Technology   | Purpose |
|-------------|---------|
| **Next.js (App Router)** | React framework with file-based routing, Server Components, and API routes. App Router provides `/app` directory structure, dynamic segments for `/[shortCode]`, and `route.ts` for API handlers. |
| **Tailwind CSS** | Utility-first CSS for layout, typography, and responsive design. Used for the form, table, buttons, and mobile-friendly breakpoints without separate CSS files. |
| **Prisma** | ORM for type-safe database access. Used to create/read/update the `Url` model and to keep schema in sync with the codebase via `schema.prisma`. |
| **SQLite** | File-based relational database. Chosen for simplicity, no separate server, and easy local development; connection is configured via `DATABASE_URL` (e.g. `file:./prisma/dev.db`). |

---

## 3. Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│  • Home page: form + table (React components)                    │
│  • Fetches GET /api/urls for list; POST /api/urls to shorten      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (Server)                           │
│  • API: app/api/urls/route.ts (GET list, POST create)            │
│  • Redirect: app/[shortCode]/page.tsx (lookup → increment → redirect) │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRISMA + SQLite                                │
│  • Single Url table: id, originalUrl, shortCode, clicks, createdAt │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend:** React components in `app/page.tsx` and `components/` handle the form, validation feedback, and the table. They call the API and update local state (e.g. prepend new URL to the list).
- **Backend API:** Route handlers in `app/api/urls/route.ts` perform validation, short-code generation, and persistence.
- **Redirect flow:** A request to `/{shortCode}` is handled by the dynamic page in `app/[shortCode]/page.tsx`, which looks up the URL, increments clicks, and issues an HTTP redirect to the original URL.
- **Database:** All persistent data (URLs and click counts) lives in SQLite and is accessed only through Prisma.

---

## 4. Database Schema

The application uses a single table, defined in **Prisma** as the `Url` model:

| Field         | Type     | Purpose |
|---------------|----------|---------|
| **id**        | `Int`    | Primary key, auto-increment. Uniquely identifies each record. |
| **originalUrl** | `String` | The long URL to which users are redirected. Stored after validation and optional normalization (e.g. adding `https://`). |
| **shortCode** | `String` (unique) | Short token (e.g. `abc123`) used in the path. Unique constraint prevents duplicates and allows fast lookup by code. |
| **clicks**    | `Int` (default 0) | Number of times the short link has been used. Incremented on each redirect. |
| **createdAt** | `DateTime` (default now) | When the short URL was created. Used for ordering (newest first) and display. |

The `shortCode` unique index is used for both redirect lookups and collision checks when generating new codes.

---

## 5. API Routes

### 5.1 Base path: `/api/urls`

Implemented in **`app/api/urls/route.ts`** with two methods.

#### GET `/api/urls`

- **Purpose:** Return all shortened URLs for display in the table.
- **Response:** JSON array of `Url` objects, ordered by `createdAt` descending (newest first).
- **Errors:** On failure, returns `500` with `{ error: "Failed to fetch URLs" }`.

#### POST `/api/urls`

- **Purpose:** Create a new short URL.
- **Request body:** `{ "url": "<long URL string>" }`.
- **Steps:**
  1. Parse and trim `url`; return `400` if missing.
  2. Validate with `isValidUrl()`; return `400` with a message if invalid.
  3. Normalize with `normalizeUrl()` (e.g. add `https://` if no protocol).
  4. Generate a unique short code via `generateUniqueShortCode()` (checks DB for collisions, retries or lengthens on conflict).
  5. Insert a new `Url` with `originalUrl` and `shortCode` (clicks default to 0).
  6. Return the created record as JSON.
- **Errors:** `400` for validation (missing/invalid URL), `500` for server/database errors.

---

## 6. Dynamic Routing: `/[shortCode]`

- **Route:** Any path that does not match a static route (e.g. `/`, `/api/...`) is handled by **`app/[shortCode]/page.tsx`**. Examples: `/abc123`, `/xY7kL`.
- **Behaviour:**
  1. **Params:** Next.js passes the segment as `params.shortCode` (in App Router, `params` is a Promise, so the code uses `await params`).
  2. **Validation:** If `shortCode` is missing or longer than 20 characters, the app calls `notFound()` and shows the 404 page.
  3. **Lookup:** The app looks up the record by `shortCode` in the database.
  4. **404:** If no row is found, `notFound()` is called again.
  5. **Update:** The row’s `clicks` is incremented by one using Prisma’s `increment`.
  6. **Redirect:** The server calls `redirect(url.originalUrl)`, which sends an HTTP redirect (e.g. 307) to the original URL.

This keeps redirect and click logic on the server, so every visit is counted and the user is always sent to the correct long URL.

---

## 7. Click Tracking Logic

1. **When a short link is used:** The user opens `https://<host>/<shortCode>`.
2. **Server handling:** The `[shortCode]` page runs on the server. It finds the `Url` by `shortCode`.
3. **Increment:** One is added to `clicks` with an atomic update:  
   `prisma.url.update({ where: { id }, data: { clicks: { increment: 1 } } })`.
4. **Redirect:** The response is an HTTP redirect to `originalUrl`.

Clicks are therefore counted once per request to the short URL; no client-side JavaScript is required for tracking.

---

## 8. Folder Structure

```
url-shortener/
├── app/
│   ├── api/urls/route.ts    # GET (list) and POST (create) short URLs
│   ├── [shortCode]/page.tsx # Redirect by shortCode and increment clicks
│   ├── not-found.tsx        # Custom 404 (e.g. invalid short code)
│   ├── layout.tsx           # Root layout and metadata
│   ├── page.tsx             # Home: form + URL table
│   └── globals.css          # Global and Tailwind styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # Reusable button (primary/secondary/ghost, loading)
│   │   └── Input.tsx        # Text input with optional error message
│   ├── UrlForm.tsx          # Form to submit long URL; client-side validation + API
│   ├── UrlTable.tsx         # Table: original, short link, clicks, date; copy button
│   └── UrlShortener.tsx     # Client wrapper: state, fetch list, pass new URL to table
├── lib/
│   ├── prisma.ts            # Prisma client singleton (avoids multiple instances in dev)
│   ├── short-code.ts        # Random short-code generation and uniqueness check
│   └── validation.ts        # URL validation and normalization
├── prisma/
│   └── schema.prisma        # Url model and datasource (SQLite)
├── .env.example             # Example env (e.g. DATABASE_URL)
├── README.md                # Setup and usage
└── EXPLAIN.md               # This document
```

- **`app/`** — Routes and pages (App Router); API and redirect live here.
- **`components/`** — Reusable UI and feature components (form, table, buttons/inputs).
- **`lib/`** — Shared, non-UI logic (DB client, short codes, validation).

---

## 9. Error Handling and Validation

### Validation

- **URL format:** `lib/validation.ts` uses the `URL` constructor and a regex fallback to allow only `http:` and `https:` URLs. Empty or non-string input is rejected.
- **Normalization:** `normalizeUrl()` adds `https://` when no protocol is present so stored URLs are consistent.
- **Short code:** Length and character set are controlled in `short-code.ts`; uniqueness is enforced by checking the database and retrying (or increasing length) on collision.
- **API:** POST validates presence and format of `url` and returns clear `400` messages (e.g. "URL is required", "Please enter a valid URL...").

### Error Handling

- **API:** Try/catch in route handlers; server errors return `500` with a generic message and log details server-side.
- **Redirect page:** Invalid or missing `shortCode`, or no matching row, triggers `notFound()` and the custom `app/not-found.tsx` (e.g. "Link not found" and link back home).
- **Client:** The form shows validation and API error messages next to the input; the list view shows a message if loading the URL list fails.

---

## 10. Future Improvements

- **Analytics:** Store timestamp, referrer, or user-agent per click for basic analytics (could be a separate `Click` model or append-only log).
- **Expiration:** Add optional `expiresAt` to `Url` and skip redirect (or return 410) when expired.
- **Custom short codes:** Allow users to choose a custom `shortCode` (with validation and uniqueness check).
- **Authentication:** Protect creation or listing with login (e.g. NextAuth) and optionally scope URLs per user.
- **Rate limiting:** Throttle POST `/api/urls` and/or redirects by IP to reduce abuse.
- **Caching:** Cache short-code → originalUrl lookups (e.g. in-memory or Redis) to reduce DB load on high-traffic redirects.
- **Migrations:** Use `prisma migrate` instead of `db push` for production to keep a history of schema changes.
- **Tests:** Add unit tests for validation and short-code generation, and integration tests for API and redirect flow.

---

*This document describes the URL Shortener application as implemented for technical assignment review.*
