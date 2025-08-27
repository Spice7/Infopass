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

# SSL 인증서 디렉토리 생성
RUN mkdir -p /etc/nginx/ssl

# 빌드된 파일과 설정 복사
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL 인증서 복사 (자체 서명 인증서)
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY key.pem /etc/nginx/ssl/key.pem

# 포트 노출 (HTTP + HTTPS)
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]