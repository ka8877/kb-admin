# syntax=docker/dockerfile:1

# 1) Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Build backend and embed frontend static assets
FROM gradle:8.12.1-jdk21-alpine AS backend-build
WORKDIR /home/gradle/src
COPY backend/ ./
# Ensure static folder exists, then copy built frontend assets into it
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/
RUN gradle clean bootJar --no-daemon

# 3) Runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /home/gradle/src/build/libs/*.jar /app/app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
