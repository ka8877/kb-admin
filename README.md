# kabang-admin

초기 단계 레포입니다. Spring Boot(백엔드)와 React + Vite(프론트엔드)로 구성되어 있습니다. 이 문서는 개발/빌드 방법만 간단히 안내합니다.

## 로컬 개발

- 백엔드 (포트 8080)
  - PowerShell
    - cd backend
    - .\gradlew.bat bootRun
  - 브라우저: http://localhost:8080

- 프론트엔드 (포트 5173)
  - PowerShell
    - cd frontend
    - npm ci
    - npm run dev
  - 브라우저: http://localhost:5173
  - API는 기본적으로 http://localhost:8080 을 사용합니다.

## 빌드

- 프론트엔드 빌드
  - cd frontend
  - npm run build
  - 산출물: frontend/dist

- 백엔드 JAR 빌드
  - cd backend
  - .\gradlew.bat build
  - 산출물: backend\build\libs\*.jar
