# Admin Monorepo (Spring Boot + React)

This repository contains a Spring Boot 3.5.3 backend (Java 21, Gradle 8.12.1) and a React + TypeScript frontend (Vite, React Query, Zustand, MUI).

Both applications are built into a single Docker image with one Dockerfile. The frontend is compiled and copied into the Spring Boot static resources so the backend serves the SPA at runtime.

## Requirements
- Docker 24+
- Internet access for initial dependency downloads (can be mirrored for closed networks later)

## Project Structure
- backend/ — Spring Boot application (REST API under `/api`)  
- frontend/ — React + Vite SPA  
- Dockerfile — Multi-stage build that builds both and produces a single runnable image

## Quick Start (Docker)

1. Build the image
   docker build -t admin-full:local .

2. Run the container
   docker run --rm -p 8080:8080 admin-full:local

3. Open in browser
   http://localhost:8080

- Backend test endpoint: http://localhost:8080/api/hello

## Local Development

- Backend only (requires Java 21 and Gradle):
  - cd backend
  - gradle bootRun

- Frontend only (requires Node 20+):
  - cd frontend
  - npm install
  - npm run dev
  - The dev server proxies /api → http://localhost:8080

## Notes
- Versions are pinned to stable releases to ease closed-network mirroring.
- The Docker build copies the built frontend (`frontend/dist`) to `backend/src/main/resources/static` before building the Spring Boot jar.


## Frontend conventions and structure

- File-based routing (Next.js-like):
  - src/pages/**/index.tsx maps to URL path (e.g., src/pages/dashboard/index.tsx -> /dashboard)
- Layouts:
  - src/layouts/MainLayout.tsx — shared AppBar and container; pulls menus from src/routes/menu.ts
- Routes/Menu:
  - src/routes/menu.ts — centralized top-level menu definition for the header
- API layer (Axios):
  - src/lib/http.ts — Axios instance with interceptors (Authorization header, error normalization), baseURL from env, and typed helpers
  - src/api/** — page-scoped API modules mirroring src/pages (e.g., src/api/dashboard/index.ts exports helloApi.getHello)
  - src/api/index.ts — barrel export re-exporting page APIs and axiosClient
- Common components:
  - src/components/common/PageHeader.tsx — page title/toolbar
  - src/components/common/Loading.tsx — centered spinner
  - src/components/common/ErrorMessage.tsx — standardized error alert
- Global styles:
  - src/styles/globals.css — minimal global CSS
  - src/styles/variables.css — CSS custom properties template
- State and data:
  - Zustand stores in src/store/ (e.g., auth.ts, counter.ts)
  - React Query preconfigured in src/lib/query/client.ts
- Coding conventions:
  - Prefer const + arrow functions for components and helpers

Examples / Guides
- Add a new page:
  1) Create src/pages/users/index.tsx
  2) The route /users will be available automatically

- Add APIs for that page:
  1) Create src/api/users/index.ts and export user-related API functions
  2) Import from src/api (barrel) and use with React Query in your page

- Auth token:
  - Use useAuthStore (src/store/auth.ts) or helpers from src/lib/auth.ts to manage the token
  - Authorization: Bearer <token> header is added automatically by the Axios client if a token exists
