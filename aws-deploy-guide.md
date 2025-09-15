# AWS 배포 가이드

## 🚀 AWS EC2로 배포하기

### 1단계: EC2 인스턴스 생성

**인스턴스 설정:**
- AMI: Ubuntu Server 22.04 LTS
- 인스턴스 타입: t3.medium 이상 (Docker 빌드용)
- 스토리지: 20GB 이상
- 보안 그룹: HTTP(80), HTTPS(443), SSH(22), Custom(9000) 포트 오픈

**보안 그룹 인바운드 규칙:**
```
Port 22  (SSH)     - My IP
Port 80  (HTTP)    - Anywhere
Port 443 (HTTPS)   - Anywhere  
Port 9000 (API)    - Anywhere
```

### 2단계: EC2 초기 설정

```bash
# EC2 접속
ssh -i "your-key.pem" ubuntu@ec2-xx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com

# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
sudo systemctl start docker
sudo systemctl enable docker

# 재로그인 (권한 적용)
exit
ssh -i "your-key.pem" ubuntu@ec2-xx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com
```

### 3단계: 코드 배포

```bash
# 프로젝트 클론
git clone https://github.com/your-repo/infopass.git
cd infopass

# .env 파일 생성
cp env.example .env
vim .env
```

**환경변수 예시 (.env):**
```env
# 실제 AWS RDS 정보로 변경
SPRING_DATASOURCE_URL=jdbc:mysql://your-rds-endpoint.rds.amazonaws.com:3306/infopass?serverTimezone=Asia/Seoul
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=your-db-password

# JWT 시크릿
JWT_SECRET=your-strong-jwt-secret-key

# 소셜 로그인 - EC2 퍼블릭 도메인 사용
KAKAO_CLIENT_ID=your-kakao-id
KAKAO_CLIENT_SECRET=your-kakao-secret
KAKAO_REDIRECT_URI=http://ec2-xx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com/auth/callback/kakao

NAVER_CLIENT_ID=your-naver-id
NAVER_CLIENT_SECRET=your-naver-secret
NAVER_REDIRECT_URI=http://ec2-xx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com/auth/callback/naver
```

### 4단계: 소셜 로그인 설정 업데이트

**카카오 개발자 콘솔:**
1. https://developers.kakao.com 접속
2. 내 애플리케이션 → 앱 선택
3. 플랫폼 → Web → 사이트 도메인에 EC2 도메인 추가
4. 제품 설정 → 카카오 로그인 → Redirect URI에 EC2 callback URL 추가

**네이버 개발자 센터:**
1. https://developers.naver.com 접속  
2. 내 애플리케이션 → API 설정
3. 서비스 URL에 EC2 도메인 추가
4. Callback URL에 EC2 callback URL 추가

### 5단계: 배포 실행

```bash
# 배포 실행
docker-compose up -d --build

# 상태 확인
docker-compose ps
docker-compose logs -f

# 방화벽 확인 (Ubuntu)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 9000
```

## 🔒 보안 강화 (운영 환경)

### HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급 (도메인 필요)
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 라인 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

### nginx SSL 설정
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 나머지 nginx 설정...
}
```

## 💰 비용 최적화

### t3.micro로 시작 (프리티어)
- **프리티어**: t3.micro 1년간 무료
- **제한**: CPU 크레딧 시스템 (지속적인 고부하 불가)
- **권장**: 초기 테스트용, 나중에 스케일업

### Auto Scaling (필요시)
```yaml
# docker-compose.yml에 추가
  infopass-back:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🔧 트러블슈팅

**메모리 부족 시:**
```bash
# 스왑 메모리 설정 (t3.micro용)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Docker 빌드 실패 시:**
```bash
# Docker 메모리 정리
docker system prune -af
docker volume prune -f

# 개별 빌드 (메모리 절약)
docker-compose build --no-cache infopass-back
docker-compose build --no-cache infopass-front
docker-compose up -d
```

**DB 연결 실패 시:**
- AWS RDS 보안 그룹에서 EC2 보안 그룹 허용
- RDS 퍼블릭 액세스 활성화 여부 확인
