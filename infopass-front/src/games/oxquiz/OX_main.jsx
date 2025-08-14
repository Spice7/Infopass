import React, { useEffect, useState } from 'react'
import './OX_Quiz.css'

// ========================================
// 🧩 파일 개요 (메인 화면)
// - OX 게임 진입 메인: 로딩 → 연출(우주선/레이저/폭발) → 싱글/멀티 버튼
// - 비주얼 중심, 페이지 전환은 window.location 사용
// ========================================

const styles = {
  container: {
    width: '60vw',
    height: '75vh',
    minWidth: '600px',
    minHeight: '400px',
    //backgroundColor: '#5ca5e9',
    background: 'url(/ox_image/002.png) center/cover no-repeat',
    borderRadius: '32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    margin: 'auto',
    marginTop: '150px',
    position: 'absolute',
    left: '0', right: '0', top: '0', bottom: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0 0 0',
    zIndex: 10,
    overflow: 'hidden',
  },
  loading: {
    width: '60vw',
    height: '75vh',
    minWidth: '600px',
    minHeight: '400px',
    backgroundColor: '#5ca5e9',
    borderRadius: '32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    margin: 'auto',
    marginTop: '150px',
    position: 'absolute',
    left: '0', right: '0', top: '0', bottom: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: '2px',
    zIndex: 20,
  },
  // ...이하 기존 styles...
  beige: {
    width: '150px',
    transform: 'rotate(-10deg)',
    position: 'absolute',
    left: '12%',
    top: '30%',
    zIndex: 3,
    transition: 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)',
  },
  blue: {
    width: '150px',
    transform: 'rotate(15deg)',
    position: 'absolute',
    left: '45%',
    top: '8%',
    zIndex: 3,
    transition: 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)',
  },
  green: {
    width: '150px',
    transform: 'rotate(8deg)',
    position: 'absolute',
    left: '80%',
    top: '2%',
    zIndex: 3,
    transition: 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)',
  },
  pink: {
    width: '150px',
    transform: 'rotate(-30deg)',
    position: 'absolute',
    left: '65%',
    top: '55%',
    zIndex: 2,
    transition: 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)',
  },
  yellow: {
    width: '150px',
    transform: 'rotate(25deg)',
    position: 'absolute',
    left: '20%',
    top: '55%',
    zIndex: 2,
    transition: 'all 0.8s cubic-bezier(.68,-0.55,.27,1.55)',
  },
  greenlaser: {
    width: '70px',
    height: '350px',
    transform: 'rotate(8deg)',
    position: 'absolute',
    left: '80.8%',
    top: '18%',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 0.3s, height 0.5s',
  },
  greenboom: {
    width: '290px',
    transform: 'rotate(12deg)',
    position: 'absolute',
    left: '67.8%',
    top: '51%',
    zIndex: 0,
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  oxlogo: {
    width: '800px',
    zIndex: 2,
    position: 'absolute',
    left: '15%',
    top: '10%',
    animation: 'blink 0.4s linear 5 alternate',
    opacity: 1,
  },
  multibutton: {
    width: '200px',
    position: 'absolute',
    top: '60%',
    animation: 'blink 0.4s linear 5 alternate',
    opacity: 1,
    cursor: 'pointer',
  },
  singlebutton: {
    width: '200px',
    position: 'absolute',
    top: '70%',
    animation: 'blink 0.4s linear 5 alternate',
    opacity: 1,
    cursor: 'pointer',
  }
}

// 전역 CSS(OX_Quiz.css)에서 keyframes 정의 사용

const OX_main = () => {
  const [showShips, setShowShips] = useState(false)
  const [showLaser, setShowLaser] = useState(false)
  const [showBoom, setShowBoom] = useState(false)
  const [loading, setLoading] = useState(true)
  const [walkFrame, setWalkFrame] = useState(0) // 걷기 프레임 상태 추가

  // 우주선 등장 전 위치(밖에서 날아오는 효과)
  const [shipPos, setShipPos] = useState({
    beige: { left: '-20%', top: '80%' },
    blue: { left: '100%', top: '-20%' },
    green: { left: '120%', top: '60%' },
    pink: { left: '50%', top: '120%' },
    yellow: { left: '-15%', top: '-10%' },
  })

  useEffect(() => {
    // 걷기 애니메이션 타이머
    let walkTimer
    if (loading) {
      walkTimer = setInterval(() => {
        setWalkFrame(prev => (prev + 1) % 4)
      }, 180) // 0.18초마다 프레임 변경 (빠르게 걷는 느낌)
    }

    // 3초간 로딩 후 화면 전환
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // 1. 우주선 날아오기 (로딩 끝난 뒤에만 실행)
    let shipTimer, laserTimer, boomTimer
    if (!loading) {
      shipTimer = setTimeout(() => {
        setShowShips(true)
        setShipPos({
          beige: {}, blue: {}, green: {}, pink: {}, yellow: {}
        })
        // 2. 레이저 발사
        laserTimer = setTimeout(() => {
          setShowLaser(true)
          boomTimer = setTimeout(() => setShowBoom(true), 350)
        }, 1000)
      }, 1800)
    }

    return () => {
      clearInterval(walkTimer)
      clearTimeout(timer)
      clearTimeout(shipTimer)
      clearTimeout(laserTimer)
      clearTimeout(boomTimer)
    }
  }, [loading])

  // 우주선 스타일 병합
  const getShipStyle = (name) => ({
    ...styles[name],
    ...(showShips ? shipPos[name] : shipPos[name])
  })
  const entermultigame=()=>{
      window.location.href='OX_Lobby';
  }
  const enterSingleGame=()=>{
    window.location.href='OX_SingleGame';
  }

  if (loading) {
    const walkImgs = [
      "/ox_image/walk1.png",
      "/ox_image/walk2.png",
      "/ox_image/walk3.png",
      "/ox_image/walk4.png"
    ]
    return (
      <div style={styles.loading}>
        <img src={walkImgs[walkFrame]} alt="" style={{width:'100px'}}/>
        로딩중...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 우주선들 */}
      <img src="/ox_image/char1.png" alt="" style={getShipStyle('beige')} />
      <img src="/ox_image/char2.png" alt="" style={getShipStyle('blue')} />
      <img src="/ox_image/char3.png" alt="" style={getShipStyle('green')} />
      <img src="/ox_image/char4.png" alt="" style={getShipStyle('pink')} />
      <img src="/ox_image/char5.png" alt="" style={getShipStyle('yellow')} />

      {/* 레이저/버스트 */}
      <img src="/ox_image/laserGreen1.png" style={{ ...styles.greenlaser, opacity: showLaser ? 1 : 0, height: showLaser ? '350px' : '0px' }} />
      <img src="/ox_image/laserGreen_burst.png" style={{ ...styles.greenboom, opacity: showBoom ? 1 : 0 }} />

      {/* 로고/버튼 */}
      <img src="/ox_image/oxgame_logo.png" alt="OX Quiz Logo" style={styles.oxlogo} />
      <img src="/ox_image/multibutton.png" alt="" style={styles.multibutton} onClick={entermultigame}/>
      <img src="/ox_image/singlebutton.png" alt="" style={styles.singlebutton} onClick={enterSingleGame}/>
    </div>
  )
}

export default OX_main