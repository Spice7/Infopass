#!/bin/bash

echo "🚀 InfoPass Docker 배포 시작..."

# .env 파일 존재 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. env.example을 참조하여 생성해주세요."
    exit 1
fi

echo "📦 기존 컨테이너 정리..."
docker-compose down --remove-orphans

echo "🔨 이미지 빌드 및 컨테이너 시작..."
docker-compose up -d --build

echo "⏳ 백엔드 헬스체크 대기 중..."
sleep 30

# 백엔드 헬스체크
if curl -f http://localhost:9000/actuator/health > /dev/null 2>&1; then
    echo "✅ 백엔드 정상 실행 중"
else
    echo "❌ 백엔드 헬스체크 실패"
    echo "로그 확인:"
    docker-compose logs infopass-back
    exit 1
fi

# 프론트엔드 접근 테스트
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ 프론트엔드 정상 접근 가능"
else
    echo "❌ 프론트엔드 접근 실패"
    echo "로그 확인:"
    docker-compose logs infopass-front
    exit 1
fi

echo ""
echo "🎉 배포 완료!"
echo "🌐 프론트엔드: http://localhost"
echo "⚡ 백엔드: http://localhost:9000"
echo "💓 헬스체크: http://localhost:9000/actuator/health"
echo ""
echo "📋 상태 확인: docker-compose ps"
echo "📄 로그 확인: docker-compose logs -f"
