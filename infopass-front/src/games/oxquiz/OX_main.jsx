import React, { useEffect, useState } from 'react'
import './OX_Quiz.css'

// 🔹 걷기 이미지 배열을 컴포넌트 밖으로 선언 (렌더링마다 재생성 방지)
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`)

const OX_main = () => {
  const [showShips, setShowShips] = useState(false)
  const [showLaser, setShowLaser] = useState(false)
  const [showBoom, setShowBoom] = useState(false)
  const [loading, setLoading] = useState(true)
  const [walkFrame, setWalkFrame] = useState(0)
  const [shipPos, setShipPos] = useState({
    beige: { left: '-20%', top: '80%' },
    blue: { left: '100%', top: '-20%' },
    green: { left: '120%', top: '60%' },
    pink: { left: '50%', top: '120%' },
    yellow: { left: '-15%', top: '-10%' },
  })

  // 🔹 걷기 애니메이션 (loading 중에만 실행)
  useEffect(() => {
    if (!loading) return

    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length)
    }, 180)

    return () => clearInterval(walkTimer)
  }, [loading])

  // 🔹 loading 상태가 끝났을 때 애니메이션 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading) return

    const shipTimer = setTimeout(() => {
      setShowShips(true)
      setShipPos({
        beige: {}, blue: {}, green: {}, pink: {}, yellow: {}
      })

      const laserTimer = setTimeout(() => {
        setShowLaser(true)

        const boomTimer = setTimeout(() => {
          setShowBoom(true)
        }, 350)

        return () => clearTimeout(boomTimer)
      }, 1000)

      return () => clearTimeout(laserTimer)
    }, 1800)

    return () => clearTimeout(shipTimer)
  }, [loading])

  // 🔹 우주선 스타일
  const getShipStyle = (name) => ({
    ...(showShips ? shipPos[name] : shipPos[name])
  })

  const entermultigame = () => {
    window.location.href = 'OX_MultiGame'
  }

  const enterSingleGame = () => {
    window.location.href = 'OX_SingleGame'
  }

  // 🔹 로딩 중일 때 걷는 캐릭터 표시
  if (loading) {
    return (
      <div className="ox-loading">
        <img src={walkImgs[walkFrame]} alt="" style={{ width: '100px' }} />
        로딩중...
      </div>
    )
  }

  return (
    <div className="ox-container">
      {/* 우주선들 */}
      <img src="/ox_image/shipBeige_manned.png" alt="" className="ox-beige" style={getShipStyle('beige')} />
      <img src="/ox_image/shipBlue_manned.png" alt="" className="ox-blue" style={getShipStyle('blue')} />
      <img src="/ox_image/shipGreen_manned.png" alt="" className="ox-green" style={getShipStyle('green')} />
      <img src="/ox_image/shipPink_manned.png" alt="" className="ox-pink" style={getShipStyle('pink')} />
      <img src="/ox_image/shipYellow_manned.png" alt="" className="ox-yellow" style={getShipStyle('yellow')} />

      {/* 레이저/버스트 */}
      <img src="/ox_image/laserGreen1.png" className="ox-greenlaser" style={{ opacity: showLaser ? 1 : 0, height: showLaser ? '350px' : '0px' }} />
      <img src="/ox_image/laserGreen_burst.png" className="ox-greenboom" style={{ opacity: showBoom ? 1 : 0 }} />

      {/* 로고/버튼 */}
      <img src="/ox_image/oxgame_logo.png" alt="OX Quiz Logo" className="ox-logo" />
      <img src="/ox_image/multibutton.png" alt="" className="ox-multibutton" onClick={entermultigame} />
      <img src="/ox_image/singlebutton.png" alt="" className="ox-singlebutton" onClick={enterSingleGame} />
    </div>
  )
}

export default OX_main
