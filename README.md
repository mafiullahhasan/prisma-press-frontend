# Prisma Press — Blog Platform Frontend

The web client for [Prisma Press](https://github.com/mafiullahhasan/prisma-press-backend), built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and shadcn/ui. Readers can browse and discuss articles, writers publish posts with image uploads, subscribers unlock premium content through Stripe, and admins moderate content from a dashboard. The whole interface is responsive from phones to desktops.

**Live demo:** https://prisma-press-frontend.vercel.app
**API:** https://prisma-press-api-two.vercel.app

## 🚀 Features

### 🔐 Authentication
- Login and registration forms with client- and server-side validation
- JWTs kept in **httpOnly cookies**, never exposed to browser JavaScript
- Automatic access-token refresh using the refresh token when the API returns `401`
- Route protection in `proxy.ts`, with redirect back to the requested page after login

### 📰 Reading
- Home page with the latest posts
- News listing with search, sorting (newest, oldest, most viewed, A–Z) and numbered pagination
- Post details with view count, tags, and approved comments showing author name and avatar
- Premium page behind a paywall for logged-in subscribers

### ✍️ Writing (Dashboard)
- Create, edit, and delete posts: title, content, status (Published / Draft / Archive), featured and premium flags
- **Pill-style tag input:** Enter or comma adds a tag, paste a list, ×/Backspace removes one
- **Cloudinary image uploads** with drag & drop, preview, and a live upload percentage
- Overview with personal stats, a profile editor, and a list of the user's comments

### 💬 Comments
- Post, edit, and delete your own comments
- Admins can reject (moderate) any comment

### 💳 Subscriptions
- Stripe Checkout (test mode) for premium access
- Subscription status, renewal date, and cancel-at-period-end

### 🛡️ Admin
- Platform statistics: posts by status, views, and comments by status
- Manage every post: edit, delete, and moderate its comments

### 📱 UI / UX
- Fully responsive. On phones the dashboard uses a sticky tab bar with carousel arrows, and tables become card lists
- Theme-matched shadcn/ui components (Select, Checkbox, AlertDialog, and more)
- Skeleton loaders, toasts, empty and error states, and gradient fallbacks for broken image URLs

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Cache Components, Partial Prerendering)
- **UI library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui on Base UI, lucide-react icons
- **Notifications:** sonner
- **Media:** Cloudinary (signed direct uploads)
- **Payments:** Stripe Checkout (handled by the API)
- **Deployment:** Vercel
- **Package manager:** pnpm

## 🏗️ Architecture

```text
Browser ──► Next.js Server (Server Components / Server Actions) ──► Prisma Press API
   │                    │
   │                    └─ reads httpOnly cookies, attaches the Bearer token,
   │                       refreshes it on 401, then calls the API
   │
   └──── direct signed upload (with progress) ──► Cloudinary
```

- **Server-only API layer** (`lib/api.ts`): every backend call runs on the server, so tokens never reach the client.
- **Reads** live in `lib/data.ts` and are rendered inside `<Suspense>` boundaries (required by Cache Components).
- **Writes** are Server Actions in `actions/`. They validate input, call the API, and refresh the affected route.
- **Uploads:** the server signs a short-lived Cloudinary upload ticket, and the browser uploads directly with progress.
  - Profile photos overwrite `prisma-press/profiles/<userId>`, so no duplicate copies are created.
  - Post thumbnails go to `prisma-press/thumbnails/`. Replaced or deleted images are removed from Cloudinary only after the API confirms the change.

## 📂 Project Structure

```text
actions/                 # Server Actions (posts, comments, profile, subscription, uploads)
app/
├── (authGroup)/         # /login, /register
├── (publicGroup)/       # /, /news, /news/[id], /premium, /payment
├── (dashboardGroup)/    # /dashboard/*, /admin-dashboard
├── layout.tsx
└── not-found.tsx
components/
├── ui/                  # shadcn/ui primitives
├── shared/              # navbar, post card, pagination, image upload, tag input…
├── dashboard/           # sidebar / mobile tab bar, profile form
├── posts/               # post form, owner actions, mobile cards
├── comments/            # comment form & item
└── subscription/        # subscribe button
hooks/                   # useImageUpload, useActionToast
lib/
├── api.ts               # server-only fetch wrapper with token refresh
├── data.ts              # data access (users, posts, comments, subscription)
├── cloudinary.ts        # upload signing, URL → public_id, deletion
├── types.ts             # shared types matching the API
└── format.ts            # formatting helpers, PAGE_SIZE
proxy.ts                 # route protection (Next.js 16 replacement for middleware)
```

## 🧭 Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Hero and latest posts |
| `/news`, `/news/[id]` | Public | Post list (search, sort, pagination) and post details with comments |
| `/premium` | Subscribers | Premium articles; shows a paywall otherwise |
| `/payment` | Public | Stripe checkout cancelled page |
| `/login`, `/register` | Guests | Authentication |
| `/dashboard` | Logged in | Overview |
| `/dashboard/profile` | Logged in | Edit name, email, photo, bio |
| `/dashboard/my-posts` · `/new` · `/[id]/edit` | Logged in | Manage posts |
| `/dashboard/my-comments` · `/[id]` | Logged in | Manage comments |
| `/dashboard/subscription` | Logged in | Subscribe / cancel |
| `/admin-dashboard` | Admin | Stats and content management |

## ⚙️ Getting Started

### Prerequisites

- Node.js 20.9 or later
- pnpm
- A running [Prisma Press API](https://github.com/mafiullahhasan/prisma-press-backend) (locally on `http://localhost:5000` by default)
- A Cloudinary account (for image uploads)

### Installation

```bash
git clone https://github.com/mafiullahhasan/prisma-press-frontend.git
cd prisma-press-frontend
pnpm install
```

### Environment Configuration

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `BACKEND_API_URL` | API base URL used by the server, e.g. `http://localhost:5000` |
| `NEXT_PUBLIC_BACKEND_API_URL` | Same URL, available in the browser |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. **Server-only: never prefix with `NEXT_PUBLIC_`** |

Never commit `.env` or secret credentials.

### Development

```bash
pnpm dev
```

Open http://localhost:3000.

### Lint, Build, and Production

```bash
pnpm lint
pnpm build
pnpm start
```

## ☁️ Deployment

The app is deployed on **Vercel** and connected to this GitHub repository, so every push to `main` triggers a production deployment.

Set the five environment variables above in **Vercel → Project → Settings → Environment Variables**. `BACKEND_API_URL` must point to the deployed API, and the API's `APP_URL` must point back to this site (used for CORS and Stripe redirects).

## 📊 Lighthouse (production)

| Page | Device | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| Home | Desktop | 98 | 100 | 100 | 100 |
| Home | Mobile | 88 | 100 | 100 | 100 |
| News | Desktop | 95 | 98 | 100 | 100 |
| Login | Desktop | 100 | 98 | 100 | 100 |

Measured with Lighthouse 13 on the live deployment. Cumulative Layout Shift is about 0 on all pages.

## 🧪 Testing

Automated tests are not configured yet. Changes have been verified manually and with scripted headless-browser checks, including mobile overflow, interaction, and hydration checks.

## ⚠️ Known Limitations

- No automated test suite yet.
- Security headers (CSP, X-Frame-Options, and others) are not configured yet. Mozilla Observatory grade: C.
- Images from Cloudinary are not yet served with responsive transformations, so mobile LCP is about 3 s.
- Stripe runs in test mode. Use card `4242 4242 4242 4242`.
- Cloudinary cleanup on delete runs through this frontend. Posts deleted directly through the API keep their images.

## 📌 Project Status

A learning and portfolio project focused on modern Next.js architecture (App Router, Server Actions, Cache Components), secure cookie-based authentication, media uploads, payments, and responsive UI.
