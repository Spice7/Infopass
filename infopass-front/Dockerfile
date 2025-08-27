# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# 빌드 시 devDependencies 꼭 설치되게 강제
ENV NPM_CONFIG_PRODUCTION=false
# 메모리 여유 (t2.small이면 1536 정도 권장)
ENV NODE_OPTIONS="--max-old-space-size=1536"

# 패키지 설치
COPY package*.json ./
RUN npm ci --no-audit --no-fund --progress=false

# 소스 복사 + 빌드
COPY . .
RUN npm run build

# Runtime stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]