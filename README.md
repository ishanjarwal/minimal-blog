# minimal-blog

> A developer-first, minimalist personal blog built with **Next.js (App Router)**, **Tailwind CSS v4**, **shadcn/ui**, **Prisma v8**, and **PostgreSQL**. Crafted to match the sharp, GitHub/terminal aesthetic of [ishanjarwal.com](https://ishanjarwal.com).

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v8-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ✦ Overview

`minimal-blog` is an open-source, minimal yet fully functional personal blog application designed for engineers who love clean markdown, fast page loads, and zero bloat. It shares the exact visual DNA of Ishan Jarwal's portfolio (`ishanjarwal.com`), featuring mono-spaced typography, sharp borders (`radius: 0px`), classic underlined blue hypertext, and full light/dark theme toggle support.

Designed to be hosted on `blog.myportfolio.com` (or any custom domain/VPS) as a self-contained containerized service.

---

## ✦ Key Features

- **Terminal & GitHub Readme Aesthetic**: Clean, high-contrast UI with monospace Geist font, 0px border radius, and GitHub-style light & dark themes powered by standard shadcn theme tokens (no arbitrary color values).
- **Streamlined Home Feed**: Starts directly with the latest articles section, designed to seamlessly feel like a native extension of [ishanjarwal.com](https://ishanjarwal.com).
- **Optional Thumbnail Support**: Feed cards conditionally render rich media thumbnails when uploaded, gracefully falling back to clean monospace typography when omitted.
- **Home Feed with Pagination**: Clean list of published articles with estimated reading time, tags, publication dates, and paginated navigation.
- **Rich Markdown Reader**: GitHub-flavored markdown rendering with syntax-highlighted code blocks, tables, blockquotes, and responsive media.
- **Tag Collections (`/tag/[slug]`)**: Instant filtering and grouping of articles by topics and tags.
- **Dev.to-Style Write & Edit Studio**:
  - Two-tab interface: **Write** (raw Markdown) and **Preview** (live formatted HTML).
  - Direct image uploads to **Cloudinary** with secure URLs inserted automatically.
  - Video embed support (YouTube, Loom, direct video links).
  - Drafts and published status toggles.
- **Zero-Friction Admin Protection**:
  - Personal blog model: no complex multi-user registration or bulky OAuth.
  - Secure passkey / secret token protection on write, edit, and mutation endpoints.
- **Comprehensive SEO & Discovery Suite**:
  - Full **Schema.org JSON-LD** structured data: `WebSite`, `Person`, `BlogPosting` (with wordCount, dates, author), `BreadcrumbList`, `CollectionPage`, and `ItemList`.
  - Dynamic **OpenGraph Image Generation** (`/api/og`) using `next/og` producing branded 1200x630 social preview cards.
  - Automated XML sitemap (`/sitemap.xml`) and search-engine optimized `robots.txt`.
  - Native **RSS 2.0 & Atom Feed** (`/rss.xml`, `/feed.xml`) with footer syndication.
  - Web App Manifest (`manifest.webmanifest`) and strict canonical URLs across all public routes.
  - Defensive `X-Robots-Tag: noindex, nofollow, noarchive` blocking crawler indexing on admin challenge and studio routes.
- **Built for VPS Deployment**:
  - Built-in lightweight rate limiting to protect API routes and mutations from abuse.
  - Input sanitization & Zod validation for rock-solid security.
  - Dockerized with modular Docker Compose configs (`compose.yml`, `compose.dev.yml`, `compose.prod.yml`).

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) (Light / Dark mode toggle) |
| **Database & ORM** | [Prisma v8](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) |
| **Media Hosting** | [Cloudinary](https://cloudinary.com/) (Direct / signed image storage) |
| **Markdown** | React Markdown / unified / remark / rehype with Shiki / Prism syntax highlighting |
| **Security** | In-memory token bucket rate limiting, Zod schema validation, secure admin cookie/key |
| **DevOps** | Multi-stage Dockerfile, Docker Compose (Base, Dev, Prod) |

---

## ✦ Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** / **npm** / **yarn**
- **Docker** & **Docker Compose** (for running PostgreSQL or full container stack)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/minimal-blog.git
cd minimal-blog
npm install
```

### 2. Configure Environment Variables

Duplicate the environment template:

```bash
cp .env.development .env.local
```

Fill in the required variables (see [Environment Variables](#-environment-variables) below).

### 3. Initialize the Database

Start the PostgreSQL database via Docker or your local PostgreSQL server, then run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✦ Environment Variables

The project uses `.env.development` and `.env.production`. Key variables:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/minimal_blog?schema=public` |
| `ADMIN_SECRET_KEY` | Secret token to access `/write` and edit pages | `super-secret-random-token-here` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL of the blog | `https://blog.myportfolio.com` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name for media | `my-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abcdefghijklmnopqrstuvwxyz` |
| `CLOUDINARY_FOLDER` | Destination folder on Cloudinary | `minimal-blog` |

---

## ✦ Docker & Compose Deployment

Run with Docker Compose:

### Development:
```bash
docker compose -f compose.yml -f compose.dev.yml up --build
```

### Production:
```bash
docker compose -f compose.yml -f compose.prod.yml up -d --build
```

---

## ✦ Documentation & Architecture

For deep-dive architectural specifications, database schemas, and step-by-step roadmap:
- 📖 [Project Blueprint & Architecture](.agent/WIKI.md)
- 📋 [Agile Implementation Plan](.agent/PLAN.md)

---

## ✦ License

This project is open-source and available under the [MIT License](LICENSE).
