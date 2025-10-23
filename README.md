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

- Routing:
  - Central registry: src/routes/registry.ts declares front-managed routes. App.tsx renders Routes from this registry.
  - Left/top menus come from backend via src/api/menu and src/store/menu, and SideNav shows them. SideNav filters unknown paths against the registry to avoid broken links.
- Layouts:
  - src/layouts/MainLayout.tsx — shared AppBar and container; loads menus via store/menu and renders SideNav.
- API layer (Axios):
  - src/lib/http.ts — Axios instance with interceptors (Authorization header, error normalization), baseURL from env, and typed helpers
  - src/api/** — page-scoped API modules mirroring src/pages (e.g., src/api/dashboard/index.ts exports helloApi.getHello)
  - src/api/index.ts — barrel export re-exporting page APIs and axiosClient
- Common components:
  - src/components/common/PageHeader.tsx — page title/toolbar
  - src/components/common/Loading.tsx — centered spinner
  - src/components/common/ErrorMessage.tsx — standardized error alert
- State and data:
  - Zustand stores in src/store/ (e.g., menu.ts)
  - React Query can be used per-page; see dashboard example
- Coding conventions:
  - Prefer const + arrow functions for components and helpers

Examples / Guides
- Add a new page:
  1) Create src/pages/users/index.tsx and export default UsersPage
  2) Register it in src/routes/registry.ts: { path: '/users', Component: UsersPage }

- Add APIs for that page:
  1) Create src/api/users/index.ts and export user-related API functions
  2) Import from src/api (barrel) and use with React Query in your page

- Auth token:
  - Use useAuthStore (src/store/auth.ts) or helpers from src/lib/auth.ts to manage the token
  - Authorization: Bearer <token> header is added automatically by the Axios client if a token exists

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

- Routing:
  - Central registry: src/routes/registry.ts declares front-managed routes. App.tsx renders Routes from this registry.
  - Left/top menus come from backend via src/api/menu and src/store/menu, and SideNav shows them. SideNav filters unknown paths against the registry to avoid broken links.
- Layouts:
  - src/layouts/MainLayout.tsx — shared AppBar and container; loads menus via store/menu and renders SideNav.
- API layer (Axios):
  - src/lib/http.ts — Axios instance with interceptors (Authorization header, error normalization), baseURL from env, and typed helpers
  - src/api/** — page-scoped API modules mirroring src/pages (e.g., src/api/dashboard/index.ts exports helloApi.getHello)
  - src/api/index.ts — barrel export re-exporting page APIs and axiosClient
- Common components:
  - src/components/common/PageHeader.tsx — page title/toolbar
  - src/components/common/Loading.tsx — centered spinner
  - src/components/common/ErrorMessage.tsx — standardized error alert
- State and data:
  - Zustand stores in src/store/ (e.g., menu.ts)
  - React Query can be used per-page; see dashboard example
- Coding conventions:
  - Prefer const + arrow functions for components and helpers

### Junior onboarding quick guide (추가 구성)
- 공통 설정
  - src/shared/config/constants.ts: APP_TITLE, DRAWER_WIDTH, API_PREFIX 등 전역 상수 중앙화
  - AppHeader/MainLayout에서 위 상수 사용
- 메뉴 구성 공통화
  - src/api/menu/index.ts: 메뉴 API 스텁(DB 대체)
  - src/store/menu.ts: 메뉴 전역 상태(menus, loading, error, loadMenus)
  - src/shared/lib/menu.ts: normalizeMenus, findActive 유틸(향후 중첩 메뉴/스키마 변경 대응)
  - src/components/layout/SideNav.tsx: 현재는 평면 리스트 렌더링. children 지원 구조로 확장 가능
- 라우트 가드 예시
  - src/components/guards/RequireAuth.tsx: accessToken 기반 보호 라우트. App.tsx에서 특정 경로를 감싸 사용
    예) <Route path="/dashboard" element={<RequireAuth><DashboardPage/></RequireAuth>} />
- 페이지 추가
  1) src/pages/users/index.tsx 파일 추가 → /users 경로 자동 생성
  2) 필요한 경우 src/api/users/index.ts에 API 모듈 추가 후 페이지에서 React Query로 사용
- 메뉴 추가
  - 임시로 src/api/menu/index.ts의 getMenus 반환값에 항목을 추가(실제 연동 시 API 응답 사용)

### 개발 팁
- HMR 안정화: vite.config.ts에 파일 변경 폴링(usePolling)과 HMR clientPort가 설정되어 있습니다.
- 스타일/테마: MUI v5를 사용합니다. 전역 테마나 디자인 토큰이 필요하면 src/shared 아래로 확장하세요.
- 상태 관리: 전역은 Zustand, 서버 데이터는 React Query 권장.
