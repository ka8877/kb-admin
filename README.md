# [프론트엔드 스펙 문서]

## 1. 기술 스택
- 앱: React 18 + TypeScript 5
- 번들러: Vite 5
- 라우팅: React Router v6
- 상태 관리:
  - 서버: @tanstack/react-query v5
  - 클라이언트: Zustand
- UI/스타일:
  - MUI (@mui/material, @emotion/*)
  - MUI X (DataGrid, Date Pickers)
  - 일부 styled-components
- 폼/검증: react-hook-form + yup
- 네트워크: axios 래퍼 (`src/lib/http.ts`)
- 유틸: dayjs, immer, uuid, react-toastify, exceljs/xlsx, jszip, react-dropzone 등

## 2. 실행 및 빌드 (PowerShell 기준)
- 포트: 개발 5173 / 백엔드 8080
- 개발 서버 실행:
  ```powershell
  npm ci
  npm run dev   # http://localhost:5173
  ```
- 프로덕션 빌드:
  ```powershell
  npm run build   # 결과물: dist/
  ```
- 빌드 미리보기:
  ```powershell
  npm run preview   # 기본 5173, strictPort
  ```
- 품질 스크립트:
  ```powershell
  npm run lint
  npm run lint:fix
  npm run format
  npm run typecheck
  ```

## 3. 디렉터리 구조 (요약)
```
src/
 ├─ api/        # API 모듈 집합 (axios 래퍼 사용)
 ├─ components/ # 공통/도메인 컴포넌트
 ├─ pages/      # 페이지 단위 컴포넌트 (라우팅 대상)
 ├─ routes/     # 메뉴/경로 상수(menu.ts), 라우트 레지스트리(registry.ts)
 ├─ lib/        # 공통 라이브러리 (http.ts, query/client.ts 등)
 ├─ store/      # Zustand 스토어 (인증, 로딩 등)
 ├─ styles/     # 전역/변수 CSS
 ├─ config.ts   # 프론트 환경설정 (apiBaseURL 등)
 ├─ main.tsx    # 앱 부트스트랩
 └─ App.tsx     # 앱 셸
```
- 경로 별칭: `@`, `@api`, `@components` 등 Vite alias 사용

## 4. 라우팅
- 정의: `src/routes/registry.ts` (React.lazy 코드 스플리팅)
- 경로 관리: `src/routes/menu.ts`의 `ROUTES` 상수로 타입 안전하게 관리
- 설정: `BrowserRouter basename={import.meta.env.BASE_URL}`
- 메뉴 트리: `src/routes/menu.ts`의 `frontMenus` 참조

## 5. 상태 관리 및 데이터 패칭
- 서버 (React Query):
  - `src/lib/query/client.ts` 설정, `main.tsx` 주입
  - `useQuery`, `useMutation` 표준 사용
- 클라이언트 (Zustand):
  - `useAuthStore`(사용자/토큰), `useLoadingStore`(로딩)

## 6. API/HTTP 레이어
- 공통 클라이언트: `src/lib/http.ts`
  - `baseURL='/api'`, `timeout=15000ms`
  - 요청: Authorization 헤더 자동 주입, 글로벌 로딩 시작
  - 응답: 성공/에러 모두 로딩 종료, 에러는 `ApiError` 타입 정규화
- 개발 프록시: `vite.config.ts` (`/api` → `localhost:8080`)
- 환경값: `src/config/env.ts` 참조

## 7. UI/스타일
- 테마: `main.tsx`에서 `ThemeProvider`로 커스텀 테마(`src/theme`) 주입
- 컴포넌트: MUI 기본 + MUI X(DataGrid 등) 활용
- 스타일링: Emotion 중심, 일부 styled-components 혼용
- 알림: react-toastify (`ToastContainer` 전역 등록)

## 8. 코딩 컨벤션 및 배포
- 경로는 Vite alias(`@components` 등) 사용
- API는 `src/api` 하위 관리, 폼은 hook-form + yup 권장
- 정적분석: ESLint + Prettier + TS (`npm run lint` / `npm run typecheck`)
- 배포:
  - 빌드 산출물: `dist/`
  - 라우터 `basename`과 배포 경로 일치 필요
  - 런타임 API는 `/api` 상대 경로 기준 (동일 도메인/프록시 전제)

### Docker로 정적 서빙(권장)

```powershell
docker build -t kabang-admin-frontend .
docker run --rm -p 8080:80 kabang-admin-frontend
```

- 접속: http://localhost:8080
