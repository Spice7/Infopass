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
COPY ssl/cert.pem /etc/nginx/ssl/cert.pem
COPY ssl/key.pem /etc/nginx/ssl/key.pem

# 환경변수 주입을 위한 스크립트 생성
RUN apk add --no-cache bash

# 환경변수를 JavaScript로 주입하는 스크립트 생성
RUN echo '#!/bin/bash' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'if [ -n "$VITE_API_BASE_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "환경변수 주입 시작..."' >> /docker-entrypoint.sh && \
    echo '  echo "VITE_API_BASE_URL: $VITE_API_BASE_URL"' >> /docker-entrypoint.sh && \
    echo '  echo "VITE_FRONTEND_URL: $VITE_FRONTEND_URL"' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|http://localhost:9000|$VITE_API_BASE_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|https://localhost:9000|$VITE_API_BASE_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|localhost:9000|$VITE_API_BASE_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|http://localhost:5173|$VITE_FRONTEND_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|https://localhost:5173|$VITE_FRONTEND_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  sed -i "s|localhost:5173|$VITE_FRONTEND_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo '  echo "환경변수 주입 완료"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 포트 노출 (HTTP + HTTPS)
EXPOSE 80 443

CMD ["/docker-entrypoint.sh"]