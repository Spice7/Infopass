import React, { useState, useEffect } from 'react';
import './OX_Quiz.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

// ========================================
// 🎮 OX 퀴즈 게임 - 멀티플레이 모드
// ========================================
// 이 페이지는 2인용 OX 퀴즈 게임입니다.
// - 로딩 애니메이션 (걷는 캐릭터)
// - 3-2-1 카운트다운
// - OX 퀴즈 문제 풀이
// - 타이머 및 생명력 시스템
// - 틀렸을 때 몬스터 공격 애니메이션
// - 두 플레이어의 점수와 생명력 표시
// ========================================

// 🔹 게임 설정 상수
const MAX_LIFE = 3;           // 최대 생명력
const TIMER_DURATION = 10;    // 문제당 제한 시간 (초)
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`);

const OX_MultiGame = () => {
  // ========================================
  // 🎯 게임 상태 관리
  // ========================================
  const [myOX, setMyOX] = useState(null);           // 플레이어가 선택한 O/X
  const [myScore, setMyScore] = useState(0);        // 내 점수
  const [enemyScore, setEnemyScore] = useState(0);  // 상대방 점수
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);  // 남은 시간
  const [myLife, setMyLife] = useState(MAX_LIFE);   // 내 생명력
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE); // 상대방 생명력

  // ========================================
  // ⚡ 애니메이션 상태 관리
  // ========================================
  const [showMonster, setShowMonster] = useState(false);  // 몬스터 표시
  const [showLaser, setShowLaser] = useState(false);      // 레이저 표시
  const [showBoom, setShowBoom] = useState(false);        // 폭발 효과 표시
  const [isShaking, setIsShaking] = useState(false);      // 캐릭터 흔들림 효과
  const [monsterFade, setMonsterFade] = useState(false);  // 몬스터 페이드아웃
  const [laserFade, setLaserFade] = useState(false);      // 레이저 페이드아웃
  const [boomFade, setBoomFade] = useState(false);        // 폭발 페이드아웃

  // ========================================
  // 🎬 UI 상태 관리
  // ========================================
  const [loading, setLoading] = useState(true);     // 로딩 상태
  const [countdown, setCountdown] = useState(null);  // 카운트다운 숫자
  const [gameStarted, setGameStarted] = useState(false);  // 게임 시작 여부
  const [showQuiz, setShowQuiz] = useState(false);  // 퀴즈 UI 표시 여부
  const [walkFrame, setWalkFrame] = useState(0);    // 걷기 애니메이션 프레임

  // ========================================
  // 🎬 애니메이션 효과들
  // ========================================

  // 🔹 로딩 애니메이션 (걷는 이미지)
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180); // 180ms마다 프레임 변경
    return () => clearInterval(walkTimer);
  }, [loading]);

  // 🔹 로딩 끝나면 countdown 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // 1.5초 후 로딩 종료
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 countdown: 3 → 2 → 1 → 게임 시작
  useEffect(() => {
    if (!loading) {
      setCountdown(3);
      let counter = 3;
      const countdownInterval = setInterval(() => {
        counter -= 1;
        if (counter === 0) {
          clearInterval(countdownInterval);
          setCountdown(null);
          setGameStarted(true);
          setShowQuiz(true);
          setTimeLeft(TIMER_DURATION);
        } else {
          setCountdown(counter);
        }
      }, 1000); // 1초마다 카운트다운
    }
  }, [loading]);

  // 🔹 타이머 작동
  useEffect(() => {
    if (timeLeft <= 0 || !gameStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0));
    }, 100); // 0.1초마다 시간 감소
    return () => clearInterval(timer);
  }, [timeLeft, gameStarted]);

  // ========================================
  // 🎮 게임 로직 함수들
  // ========================================

  // 🔹 하트 렌더링 (생명력 표시)
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'} {/* 살아있으면 빨간하트, 죽으면 깨진하트 */}
      </span>
    ));

  // 🔹 OX 버튼 클릭 처리
  const handleOXClick = (ox) => {
    setMyOX(ox);
    if (ox === 'O') {
      // 정답일 때
      setMyScore((prev) => prev + 1);
    } else {
      // 오답일 때 - 몬스터 공격 애니메이션
      setShowMonster(true);
      setTimeout(() => {
        setShowLaser(true);
      }, 800); // 0.8초 후 레이저 발사
      setTimeout(() => {
        setShowBoom(true);
        setIsShaking(true);
        setMyLife((prev) => (prev > 0 ? prev - 1 : 0)); // 생명력 감소
      }, 1200); // 1.2초 후 폭발 및 생명력 감소
      setTimeout(() => setMonsterFade(true), 1700); // 1.7초 후 페이드아웃 시작
      setTimeout(() => setLaserFade(true), 1700);
      setTimeout(() => setBoomFade(true), 1700);
      setTimeout(() => {
        // 2초 후 모든 효과 제거
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

  // ========================================
  // 🎨 렌더링
  // ========================================

  // 🔹 로딩 화면
  if (loading) {
    return (
      <div className="ox-loading">
        <img src={walkImgs[walkFrame]} alt="로딩중" style={{ width: '100px' }} />
        로딩중...
      </div>
    );
  }

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
      <div className="ox-container" style={{ display: 'block' }}>
        {/* ======================================== */}
        {/* 📝 문제 영역 */}
        {/* ======================================== */}
        <div className="ox-quiz">
          {showQuiz ? "1. 리액트는 프레임워크이다." : ""}
        </div>

        {/* ======================================== */}
        {/* ⏰ 타이머 바 */}
        {/* ======================================== */}
        {showQuiz && (
          <div style={{
            display: 'flex',
            width: '90%',
            flexWrap: 'nowrap',
            position: 'absolute',
            top: '4%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5
          }}>
            <img src='/ox_image/alarm.png' style={{width:'40px'}} />
            <div className="ox-timerbar-wrap">
              <div
                className="ox-timerbar"
                style={{width: `${(timeLeft / TIMER_DURATION) * 100}%`}}
              />
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* 🎯 OX 버튼 */}
        {/* ======================================== */}
        {showQuiz && (
          <div className="ox-oxwrap" style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5
          }}>
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
        )}

        {/* ======================================== */}
        {/* 👥 캐릭터 영역 (두 플레이어) */}
        {/* ======================================== */}
        <div className="ox-charwrap" style={{
          position: 'absolute',
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          width: '70%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '0 100px'
        }}>
          {/* ======================================== */}
          {/* 👤 내 캐릭터 (왼쪽) */}
          {/* ======================================== */}
          <div className={`ox-char${isShaking ? ' ox-shake' : ''}`}>
            {/* 몬스터 공격 애니메이션 */}
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
            
            {/* 플레이어가 선택한 O/X 표시 */}
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
            
            {/* 내 캐릭터 정보 */}
            <img src="/ox_image/shipBeige_manned.png" alt="플레이어1" style={{ width: '90px', height: '90px' }} />
            <div className="ox-nick">플레이어1</div>
            <div className="ox-scoreboard">{myScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(myLife)}
            </div>
          </div>

          {/* ======================================== */}
          {/* 👤 상대방 캐릭터 (오른쪽) */}
          {/* ======================================== */}
          <div className="ox-char">
            {/* 상대방 캐릭터 정보 */}
            <img src="/ox_image/shipGreen_manned.png" alt="플레이어2" style={{ width: '90px', height: '90px' }} />
            <div className="ox-nick">플레이어2</div>
            <div className="ox-scoreboard">{enemyScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(enemyLife)}
            </div>
          </div>
        </div>

        {/* ======================================== */}
        {/* 🔢 카운트다운 오버레이 */}
        {/* ======================================== */}
        {countdown !== null && (
          <div className="ox-countdown-overlay">
            <h1>{countdown}</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default OX_MultiGame;