# kabang-admin

카카오뱅크 AI 검색 Admin

- 포트: 프론트 5173 / 백엔드 8080
- 운영체제 기준: Windows (PowerShell 명령 예시)

## 폴더 구조
- backend/ — Spring Boot 기반 서버
- frontend/ — Vite + React + TypeScript 기반 SPA
- Dockerfile — 컨테이너 빌드 정의

## 빠른 시작 (Frontend)
PowerShell 예시
```powershell
cd frontend
npm ci
npm run dev   # http://localhost:5173
```

프로덕션 빌드 / 미리보기
```powershell
npm run build     # 산출물: frontend/dist/
npm run preview   # 기본 포트 5173
```

메모
- 개발 중 API 호출은 `/api` 상대경로 기준입니다. Vite dev 서버가 `http://localhost:8080`으로 프록시합니다.
- 상세 스펙/구성은 `frontend/README.md`를 참고하세요.

## 백엔드 상태
- Spring Boot 기반(향후 Smurf Starter 도입 예정)
- 현재 기능 미구성 또는 준비 중입니다. 추후 구성 시 본 README를 업데이트합니다.

## 참고 문서
- 프론트엔드 스펙 문서: `frontend/README.md`
