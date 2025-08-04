import React, { useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const styles = {
  container: {
    width: '60vw',
    height: '75vh',
    minWidth: '600px',
    minHeight: '400px',
    background: 'url(/PNG/002.png) center/cover no-repeat',
    borderRadius: '32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    margin: 'auto',
    marginTop: '150px',
    position: 'absolute',
    left: '0', right: '0', top: '0', bottom: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 0 0 0',
    zIndex: 10,
    overflow: 'hidden',
  },
  quiz: {
    width: '90%',
    minHeight: '100px',
    background: 'rgba(255,255,255,0.92)',
    borderRadius: '18px',
    border: '2px solid #007bff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    margin: '0 auto 24px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px 12px',
  },
  timerBarWrap: {
    width: '80%',
    height: '18px',
    background: '#eee',
    borderRadius: '9px',
    margin: '18px auto 0 auto',
    overflow: 'hidden',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  },
  timerBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffe066 60%, #ffd700 100%)',
    transition: 'width 0.2s linear',
  },
  oxWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '100px',
  },
  oxImg: {
    width: '320px',
    height: '320px',
    cursor: 'pointer',
    transition: 'transform 0.18s, box-shadow 0.18s',
    borderRadius: '50%',
    objectFit: 'contain',
    userSelect: 'none',
  },
  oxImgActive: {
    transform: 'scale(1.08)',
  },
  charWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    marginBottom: '24px',
    padding: '0 100px',
  },
  char: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  oxAbove: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '50px',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nick: {
    marginTop: '10px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#333',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    padding: '2px 12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  scoreBoard: {
    marginTop: '10px',
    width: '80px',
    height: '38px',
    background: 'linear-gradient(180deg, #222 70%, #007bff 100%)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    borderRadius: '10px',
    border: '3px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '2px',
  },
lifeWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  heart: {
    width: '28px',
    height: '28px',
    border: '2px solid #222',
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    userSelect: 'none',
  },
  heartImg: {
    width: '18px',
    height: '18px',
    display: 'block',
  },
 monster: {
    position: 'absolute',
    top: '-350px', // 맵 밖에서 시작
    left: '50%',
    transform: 'translateX(-50%)',
    width: '150px',
    height: '150px',
    zIndex: 20,
    pointerEvents: 'none',
    animation: 'monsterDrop 0.5s cubic-bezier(0.7,0,0.5,1) forwards',
  },
  laser: {
    position: 'absolute',
    top: '-230px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '50px',
    height: '240px',
    zIndex: 21,
    pointerEvents: 'none',
    animation: 'laserDrop 0.5s cubic-bezier(0.7,0,0.5,1)',
     transformOrigin: 'top'
  },
  boom: {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '100px',
    zIndex: 22,
    pointerEvents: 'none',
    animation: 'boomShow 0.4s',
  },
  shake: {
    animation: 'shake 0.4s',
  },
  // ...나머지 스타일...
};

const keyframes = `
@keyframes monsterDrop {
  0% { opacity: 0; transform: translateX(-50%) translateY(-120px);}
  60% { opacity: 1; }
  100% { opacity: 1; transform: translateX(-50%) translateY(0);}
}
@keyframes laserDrop {
  0% {
    opacity: 0;
    transform: translateX(-50%) scaleY(0.0);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) scaleY(0.3);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scaleY(1);
  }
}
@keyframes boomShow {
  0% { opacity: 0; transform: scale(0.5) translateX(-50%);}
  60% { opacity: 1; transform: scale(1.1) translateX(-50%);}
  100% { opacity: 0; transform: scale(1) translateX(-50%);}
}
@keyframes shake {
  0% { transform: translateX(0%) translateY(0);}
  10% { transform: translateX(-10%) translateY(0);}
  20% { transform: translateX(10%) translateY(0);}
  30% { transform: translateX(-10%) translateY(0);}
  40% { transform: translateX(10%) translateY(0);}
  50% { transform: translateX(-10%) translateY(0);}
  60% { transform: translateX(10%) translateY(0);}
  70% { transform: translateX(-10%) translateY(0);}
  80% { transform: translateX(10%) translateY(0);}
  90% { transform: translateX(-10%) translateY(0);}
  100% { transform: translateX(10%) translateY(0);}
}
@keyframes fadeout {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;

const MAX_LIFE = 3;
const TIMER_DURATION = 10; // 초

const OX_MultiGame = () => {
  const [myOX, setMyOX] = useState(null); // 'O' or 'X'
  const [myScore, setMyScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);

  // 애니메이션 상태
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // fadeout 상태
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);

  // 타이머 효과
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0));
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 하트 렌더링 함수
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} style={styles.heart}>
        {idx < life ? '❤️' : '🤍'}
      </span>
    ));

  // 틀릴 때 몬스터, 레이저, 폭발, 흔들림, fadeout 효과
  const handleOXClick = (ox) => {
    setMyOX(ox);
    if (ox === 'O') {
      setMyScore((prev) => prev + 1);
    } else {
      setShowMonster(true);
      setTimeout(() => {
        setShowLaser(true);
      }, 800); // 몬스터 내려온 뒤 레이저 발사
      setTimeout(() => {
        setShowBoom(true);
        setIsShaking(true);
        setMyLife((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1200); // 레이저가 떨어진 뒤 폭발+흔들림+목숨감소

      // fadeout 트리거
      setTimeout(() => setMonsterFade(true), 1700);
      setTimeout(() => setLaserFade(true), 1700);
      setTimeout(() => setBoomFade(true), 1700);

      // fadeout 후 실제로 사라지게
      setTimeout(() => {
        setShowBoom(false);
        setIsShaking(false);
        setShowLaser(false);
        setShowMonster(false);
        setMonsterFade(false);
        setLaserFade(false);
        setBoomFade(false);
      }, 2000);
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1,
      }}>
        <div style={styles.container}>
          <div style={styles.quiz}>
            1. 리액트는 프레임워크이다.<br />
          </div>
          <div style={styles.timerBarWrap}>
            <div
              style={{
                ...styles.timerBar,
                width: `${(timeLeft / TIMER_DURATION) * 100}%`,
              }}
            />
          </div>
          <div style={styles.oxWrap}>
            <img
              src="/PNG/O.png"
              alt="O"
              style={{
                ...styles.oxImg,
                ...(myOX === 'O' ? styles.oxImgActive : {})
              }}
              onClick={() => handleOXClick('O')}
              draggable={false}
            />
            <img
              src="/PNG/X.png"
              alt="X"
              style={{
                ...styles.oxImg,
                ...(myOX === 'X' ? styles.oxImgActive : {})
              }}
              onClick={() => handleOXClick('X')}
              draggable={false}
            />
          </div>
          <div style={styles.charWrap}>
            <div style={{
              ...styles.char,
              ...(isShaking ? styles.shake : {})
            }}>
              {/* 몬스터, 레이저, 폭발 효과 */}
              {showMonster && (
                <img
                  src="/PNG/monster.png"
                  alt="monster"
                  style={{
                    ...styles.monster,
                    ...(monsterFade ? { animation: `${styles.monster.animation}, fadeout 0.3s linear` } : {})
                  }}
                  draggable={false}
                />
              )}
              {showLaser && (
                <img
                  src="/PNG/laserYellow1.png"
                  alt="laser"
                  style={{
                    ...styles.laser,
                    ...(laserFade ? { animation: `${styles.laser.animation}, fadeout 0.3s linear` } : {})
                  }}
                  draggable={false}
                />
              )}
              {showBoom && (
                <img
                  src="/PNG/laserboom2.png"
                  alt="boom"
                  style={{
                    ...styles.boom,
                    ...(boomFade ? { animation: `${styles.boom.animation}, fadeout 0.3s linear` } : {})
                  }}
                  draggable={false}
                />
              )}
              {myOX && (
                <div style={styles.oxAbove}>
                  <img
                    src={myOX === 'O' ? '/PNG/O.png' : '/PNG/X.png'}
                    alt={myOX}
                    style={{ width: '60px', height: '70px' }}
                    draggable={false}
                  />
                </div>
              )}
              <img src="/PNG/shipBeige_manned.png" alt="플레이어1" style={{ width: '90px', height: '90px' }} />
              <div style={styles.nick}>플레이어1</div>
              <div style={styles.scoreBoard}>{myScore}</div>
              <div style={styles.lifeWrap}>
                {renderHearts(myLife)}
              </div>
            </div>
            <div style={styles.char}>
              {/* 상대방 선택 표시 필요시 여기에 추가 */}
              <img src="/PNG/shipGreen_manned.png" alt="플레이어2" style={{ width: '90px', height: '90px' }} />
              <div style={styles.nick}>플레이어2</div>
              <div style={styles.scoreBoard}>{enemyScore}</div>
              <div style={styles.lifeWrap}>
                {renderHearts(enemyLife)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OX_MultiGame;