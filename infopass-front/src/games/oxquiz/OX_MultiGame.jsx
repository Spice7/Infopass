import React, { useState, useEffect } from 'react';
import './OX_Quiz.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

const MAX_LIFE = 3;
const TIMER_DURATION = 10;

const OX_MultiGame = () => {
  const [myOX, setMyOX] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0));
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '🧡'}
      </span>
    ));

  const handleOXClick = (ox) => {
    setMyOX(ox);
    if (ox === 'O') {
      setMyScore((prev) => prev + 1);
    } else {
      setShowMonster(true);
      setTimeout(() => {
        setShowLaser(true);
      }, 800);
      setTimeout(() => {
        setShowBoom(true);
        setIsShaking(true);
        setMyLife((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1200);
      setTimeout(() => setMonsterFade(true), 1700);
      setTimeout(() => setLaserFade(true), 1700);
      setTimeout(() => setBoomFade(true), 1700);
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
      <div className="ox-container">
        <div className="ox-quiz">
          1. 리액트는 프레임워크이다.<br />
        </div>
        <div style={{display: 'flex',width: '90%',flexWrap: 'nowrap'}}>
          <img src='/ox_image/alarm.png' style={{width:'40px'}} />
          <div className="ox-timerbar-wrap">
            <div
              className="ox-timerbar"
              style={{width: `${(timeLeft / TIMER_DURATION) * 100}%`}}
            />
          </div>
        </div>
        <div className="ox-oxwrap">
          <img
            src="/ox_image/O.png"
            alt="O"
            className={`ox-oximg${myOX === 'O' ? ' ox-oximg-active' : ''}`}
            onClick={() => handleOXClick('O')}
            draggable={false}
          />
          <img
            src="/ox_image/X.png"
            alt="X"
            className={`ox-oximg${myOX === 'X' ? ' ox-oximg-active' : ''}`}
            onClick={() => handleOXClick('X')}
            draggable={false}
          />
        </div>
        <div className="ox-charwrap">
          <div className={`ox-char${isShaking ? ' ox-shake' : ''}`}>
            {/* 몬스터, 레이저, 폭발 효과 */}
            {showMonster && (
              <img
                src="/ox_image/monster.png"
                alt="monster"
                className="ox-monster"
                style={monsterFade ? { animation: 'monsterDrop 0.5s cubic-bezier(0.7,0,0.5,1) forwards, fadeout 0.3s linear' } : {}}
                draggable={false}
              />
            )}
            {showLaser && (
              <img
                src="/ox_image/laserYellow1.png"
                alt="laser"
                className="ox-laser"
                style={laserFade ? { animation: 'laserDrop 0.5s cubic-bezier(0.7,0,0.5,1), fadeout 0.3s linear', transformOrigin: 'top' } : {transformOrigin: 'top'}} 
                draggable={false}
              />
            )}
            {showBoom && (
              <img
                src="/ox_image/laserboom2.png"
                alt="boom"
                className="ox-boom"
                style={boomFade ? { animation: 'boomShow 0.4s, fadeout 0.3s linear' } : {}} 
                draggable={false}
              />
            )}
            {myOX && (
              <div className="ox-oxabove">
                <img
                  src={myOX === 'O' ? '/ox_image/O.png' : '/ox_image/X.png'}
                  alt={myOX}
                  style={{ width: '60px', height: '70px' }}
                  draggable={false}
                />
              </div>
            )}
            <img src="/ox_image/shipBeige_manned.png" alt="플레이어1" style={{ width: '90px', height: '90px' }} />
            <div className="ox-nick">플레이어1</div>
            <div className="ox-scoreboard">{myScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(myLife)}
            </div>
          </div>
          <div className="ox-char">
            {/* 상대방 선택 표시 필요시 여기에 추가 */}
            <img src="/ox_image/shipGreen_manned.png" alt="플레이어2" style={{ width: '90px', height: '90px' }} />
            <div className="ox-nick">플레이어2</div>
            <div className="ox-scoreboard">{enemyScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(enemyLife)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OX_MultiGame;