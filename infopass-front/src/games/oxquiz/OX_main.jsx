import React, { useEffect, useState } from 'react'
import './OX_Quiz.css'

// ========================================
// 🎮 OX 퀴즈 게임 메인 페이지
// ========================================
// 이 페이지는 OX 퀴즈 게임의 시작 화면입니다.
// - 로딩 애니메이션 (걷는 캐릭터)
// - 우주선들이 날아오는 인트로 애니메이션
// - 싱글플레이/멀티플레이 선택 버튼
// ========================================

// 🔹 걷기 이미지 배열을 컴포넌트 밖으로 선언 (렌더링마다 재생성 방지)
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`)

const OX_main = () => {
  // ========================================
  // 🎯 상태 관리
  // ========================================
  const [showShips, setShowShips] = useState(false)        // 우주선 표시 여부
  const [showLaser, setShowLaser] = useState(false)        // 레이저 표시 여부
  const [showBoom, setShowBoom] = useState(false)          // 폭발 효과 표시 여부
  const [loading, setLoading] = useState(true)             // 로딩 상태
  const [walkFrame, setWalkFrame] = useState(0)            // 걷기 애니메이션 프레임
  const [shipPos, setShipPos] = useState({
    beige: { left: '-20%', top: '80%' },    // 베이지 우주선 초기 위치
    blue: { left: '100%', top: '-20%' },    // 파란 우주선 초기 위치
    green: { left: '120%', top: '60%' },    // 초록 우주선 초기 위치
    pink: { left: '50%', top: '120%' },     // 핑크 우주선 초기 위치
    yellow: { left: '-15%', top: '-10%' },  // 노란 우주선 초기 위치
  })

  // ========================================
  // 🎬 애니메이션 효과들
  // ========================================

  // 🔹 걷기 애니메이션 (loading 중에만 실행)
  useEffect(() => {
    if (!loading) return

    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length)
    }, 180) // 180ms마다 프레임 변경

    return () => clearInterval(walkTimer)
  }, [loading])

  // 🔹 loading 상태가 끝났을 때 애니메이션 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false) // 3초 후 로딩 종료
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // 🔹 우주선 인트로 애니메이션
  useEffect(() => {
    if (loading) return

    const shipTimer = setTimeout(() => {
      setShowShips(true) // 우주선들 표시
      setShipPos({
        beige: {}, blue: {}, green: {}, pink: {}, yellow: {} // 최종 위치로 이동
      })

      const laserTimer = setTimeout(() => {
        setShowLaser(true) // 레이저 발사

        const boomTimer = setTimeout(() => {
          setShowBoom(true) // 폭발 효과
        }, 350)

        return () => clearTimeout(boomTimer)
      }, 1000)

      return () => clearTimeout(laserTimer)
    }, 1800)

    return () => clearTimeout(shipTimer)
  }, [loading])

  // ========================================
  // 🎮 게임 모드 선택 함수들
  // ========================================

  // 🔹 멀티플레이 게임 진입
  const entermultigame = () => {
    window.location.href = 'OX_MultiGame'
  }

  // 🔹 싱글플레이 게임 진입
  const enterSingleGame = () => {
    window.location.href = 'OX_SingleGame'
  }

  // ========================================
  // 🎨 렌더링
  // ========================================

  // 🔹 로딩 중일 때 걷는 캐릭터 표시
  if (loading) {
    return (
      <div className="ox-loading">
        <img src={walkImgs[walkFrame]} alt="로딩 애니메이션" style={{ width: '100px' }} />
        로딩중...
      </div>
    )
  }

  return (
    <div className="ox-container">
      {/* ======================================== */}
      {/* 🚀 우주선들 - 각각 다른 위치에서 날아옴 */}
      {/* ======================================== */}
      <img src="/ox_image/shipBeige_manned.png" alt="베이지 우주선" className="ox-beige" style={shipPos.beige} />
      <img src="/ox_image/shipBlue_manned.png" alt="파란 우주선" className="ox-blue" style={shipPos.blue} />
      <img src="/ox_image/shipGreen_manned.png" alt="초록 우주선" className="ox-green" style={shipPos.green} />
      <img src="/ox_image/shipPink_manned.png" alt="핑크 우주선" className="ox-pink" style={shipPos.pink} />
      <img src="/ox_image/shipYellow_manned.png" alt="노란 우주선" className="ox-yellow" style={shipPos.yellow} />

      {/* ======================================== */}
      {/* ⚡ 레이저/폭발 효과 */}
      {/* ======================================== */}
      <img 
        src="/ox_image/laserGreen1.png" 
        className="ox-greenlaser" 
        style={{ 
          opacity: showLaser ? 1 : 0, 
          height: showLaser ? '350px' : '0px' 
        }} 
        alt="레이저 효과"
      />
      <img 
        src="/ox_image/laserGreen_burst.png" 
        className="ox-greenboom" 
        style={{ opacity: showBoom ? 1 : 0 }} 
        alt="폭발 효과"
      />

      {/* ======================================== */}
      {/* 🎯 게임 선택 UI */}
      {/* ======================================== */}
      <img src="/ox_image/oxgame_logo.png" alt="OX Quiz Logo" className="ox-logo" />
      <img 
        src="/ox_image/multibutton.png" 
        alt="멀티플레이 버튼" 
        className="ox-multibutton" 
        onClick={entermultigame} 
      />
      <img 
        src="/ox_image/singlebutton.png" 
        alt="싱글플레이 버튼" 
        className="ox-singlebutton" 
        onClick={enterSingleGame} 
      />
    </div>
  )
}

export default OX_main