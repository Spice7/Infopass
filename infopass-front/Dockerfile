# Build stage
FROM node:20-alpine AS build

# 빌드 시 Node 힙을 1.5GB로 제한 (2GB 인스턴스에서 안정적)
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV NODE_ENV=production

WORKDIR /app

# 패키지 설치
COPY package*.json ./
# 조금 더 가볍게(감사/감사금 끔, 진행바 끔)
RUN npm ci --no-audit --no-fund --progress=false

# 소스 복사
COPY . .

RUN npm run build

# Runtime stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]