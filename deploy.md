# InfoPass 배포 가이드

## 🚀 Docker 배포 준비 완료!

### 📁 생성된 배포 파일들
- `docker-compose.yml` - 전체 스택 오케스트레이션
- `infopass-front/Dockerfile` - 프론트엔드 컨테이너 설정
- `infopass-back/Dockerfile` - 백엔드 컨테이너 설정
- `infopass-front/nginx.conf` - Nginx 프록시 설정
- `env.example` - 환경변수 예시 파일
- `application-prod.yml` - 배포용 Spring Boot 설정

### 🔧 배포 준비 단계

#### 1. 환경변수 설정
```bash
# .env 파일 생성 (env.example을 참조)
cp env.example .env

# 실제 값으로 수정
vim .env
```

#### 2. 도메인 설정 수정 필요
다음 파일들에서 `your-domain.com`을 실제 도메인으로 변경:
- `SecurityConfig.java` (Line 112-113)
- `env.example`의 redirect URI들

#### 3. 배포 실행
```bash
# 이미지 빌드 및 컨테이너 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

### 🌐 서비스 접근
- **프론트엔드**: http://localhost (포트 80)
- **백엔드**: http://localhost:9000
- **Health Check**: http://localhost:9000/actuator/health

### 🔒 보안 설정 완료
- ✅ 중요 정보 환경변수화
- ✅ application-local.yml git 제외
- ✅ Docker 멀티스테이지 빌드
- ✅ Non-root 사용자 실행
- ✅ Health Check 설정

### 🔧 추가 권장 사항

#### SSL/HTTPS 설정 (운영 환경)
```yaml
# docker-compose.yml에 추가
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "443:443"
    volumes:
      - certs:/etc/nginx/certs
      - /var/run/docker.sock:/tmp/docker.sock:ro
```

#### 모니터링 설정
```yaml
# docker-compose.yml에 추가
  prometheus:
    image: prom/prometheus
  grafana:
    image: grafana/grafana
```

### 🐛 트러블슈팅

**컨테이너가 시작되지 않을 때:**
```bash
docker-compose logs infopass-back
docker-compose logs infopass-front
```

**DB 연결 실패시:**
- AWS RDS 보안 그룹 설정 확인
- 환경변수 값 재확인

**CORS 오류시:**
- SecurityConfig.java의 도메인 설정 확인
- nginx.conf의 프록시 설정 확인

### 📋 체크리스트
- [ ] .env 파일 생성 및 실제 값 설정
- [ ] 도메인명 변경 (your-domain.com → 실제 도메인)
- [ ] AWS RDS 보안그룹에서 Docker 호스트 IP 허용
- [ ] 소셜 로그인 redirect URI 업데이트
- [ ] SSL 인증서 설정 (운영 환경)
- [ ] 백업 및 로그 로테이션 설정
