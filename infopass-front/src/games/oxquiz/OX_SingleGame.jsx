import React, { useState, useEffect } from 'react';
import './OX_Quiz.css';
import axios from 'axios';

// ========================================
// 🎮 OX 퀴즈 게임 - 싱글플레이 모드
// ========================================

const MAX_LIFE = 3;
const TIMER_DURATION = 300;
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`);

const OX_SingleGame = () => {
  // 게임 상태
  const [myOX, setMyOX] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [quizlist, setquizlist] = useState([]);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // 캐릭터 선택
  const [selectedChar, setSelectedChar] = useState(null);
  const [showCharSelect, setShowCharSelect] = useState(false);

  // 애니메이션 상태
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [walkFrame, setWalkFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  let quizurl = 'http://localhost:9000/oxquiz/quizlist';
  
// 게임 오버 모달 상태
const [showGameOverModal, setShowGameOverModal] = useState(false);
const [gameOverType, setGameOverType] = useState(null); // 'dead' | 'clear'



  // 로딩 애니메이션
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180);
    return () => clearInterval(walkTimer);
  }, [loading]);

  // 1.5초 로딩 후 캐릭터 선택창 띄우기
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCharSelect(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  // 캐릭터 선택 후 3-2-1 카운트다운
  const handleCharSelect = (num) => {
    setSelectedChar(num);
    setShowCharSelect(false);
    setGameStarted(true);
    setCountdown(3);
    let counter = 3;
    const countdownInterval = setInterval(() => {
      counter -= 1;
      if (counter === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        setShowQuiz(true);
        setTimeLeft(TIMER_DURATION);
      } else {
        setCountdown(counter);
      }
    }, 1000);
  };

  // 타이머 작동
  useEffect(() => {
    if (timeLeft <= 0 || !gameStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0));
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, gameStarted]);

  // 퀴즈 데이터 가져오기
  useEffect(() => {
    axios.get(quizurl)
      .then((res) => {
        setquizlist(res.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
      });
  }, [gameStarted]);

  // 하트 렌더링
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'}
      </span>
    ));

  // 게임 종료 처리
  const handleGameEnd = () => {
    setGameStarted(false);
  };

  useEffect(() => {
    if (myLife === 0 && gameStarted) {
      setTimeout(() => {
        handleGameEnd(myScore);
      }, 500); // 연출 후 바로 게임 오버, 필요시 딜레이 조정
    }
  }, [myLife, gameStarted]);

  // OX 버튼 클릭 처리
  const handleOXClick = (ox) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);
    setMyOX(ox);
    const isCorrect = (ox === 'O' && quizlist[currentindex]?.answer === 1) ||
                      (ox === 'X' && quizlist[currentindex]?.answer === 0);

    if (isCorrect) {
      setResultMsg("정답입니다!");
      if (currentindex === quizlist.length - 1) {
        setMyScore(prev => {
          const finalScore = prev + 1;
          setTimeout(() => {
            handleGameEnd(finalScore);
          }, 700);
          return finalScore;
        });
      } else {
        setMyScore(prev => prev + 1);
        setTimeout(() => {
          setResultMsg("");
          setcurrentindex(currentindex + 1);
          setMyOX(null);
          setButtonDisabled(false);
        }, 1000);
      }
    } else {
      setResultMsg("오답입니다!");
      setShowMonster(true);
      setTimeout(() => setShowLaser(true), 800);
      setTimeout(() => {
        setShowBoom(true);
        setIsShaking(true);
        setMyLife(prev => (prev > 0 ? prev - 1 : 0));
      }, 1200);
      setTimeout(() => {
        setMonsterFade(true);
        setLaserFade(true);
        setBoomFade(true);
      }, 1700);
      setTimeout(() => {
        setShowBoom(false);
        setIsShaking(false);
        setShowLaser(false);
        setShowMonster(false);
        setMonsterFade(false);
        setLaserFade(false);
        setBoomFade(false);
        setButtonDisabled(false);
        setMyOX(null);
        setResultMsg("");
        if (currentindex === quizlist.length - 1) {
          setTimeout(() => {
            handleGameEnd(myScore);
          }, 100);
        } else {
          setcurrentindex(currentindex + 1);
          setMyOX(null);
        }
      }, 2000);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="ox-loading">
        <img src={walkImgs[walkFrame]} alt="로딩중" style={{ width: '100px' }} />
        로딩중...
      </div>
    );
  }

  // 캐릭터 선택 화면
  if (showCharSelect) {
    return (
      <div className="ox-charselect-bg">
        <div className="ox-charselect-box">
          <h2>캐릭터를 선택하세요!</h2>
          <div className="ox-charselect-list">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                className={`ox-charselect-btn${selectedChar === num ? ' selected' : ''}`}
                onClick={() => handleCharSelect(num)}
                value={num}
              >
                <img src={`/ox_image/char${num}.png`} alt={`캐릭터${num}`} style={{ width: 80, height: 80 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  //게임 종료 화면
  if (!gameStarted) {
    if(myLife <= 0) {
      return (
        <div className="ox-gameover">
          <h2>GAME OVER</h2>
          <p>최종 점수: {myScore}</p>
          <button onClick={() => {
            setMyScore(0);
            setMyLife(MAX_LIFE);
            setcurrentindex(0);
            setShowQuiz(false);
            setShowCharSelect(true); // 캐릭터 선택 다시 보여주기
            setSelectedChar(null);   // 선택 캐릭터 초기화
            setTimeLeft(TIMER_DURATION); // 타이머 초기화
          }}>다시 시작</button>
        </div>
      );
    }else{
      return (
        <div className="ox-gameover">
          <h2>CLEAR!</h2>
          <p>최종 점수: {myScore}</p>
          <button onClick={() => {
            setMyScore(0);
            setMyLife(MAX_LIFE);
            setcurrentindex(0);
            setShowQuiz(false);
            setShowCharSelect(true); // 캐릭터 선택 다시 보여주기
            setSelectedChar(null);   // 선택 캐릭터 초기화
            setTimeLeft(TIMER_DURATION); // 타이머 초기화
          }}>다시 시작</button>
        </div>
      );
    }
  }

  // 게임 화면
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
        {/* 문제 영역 */}
        <div className="ox-quiz">
          {resultMsg ? <span className='resultMsg'>{resultMsg}</span> : (showQuiz ? currentindex + 1 + " " + quizlist[currentindex]?.question : "")}
        </div>

        {/* 타이머 바 */}
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
            <img src='/ox_image/alarm.png' style={{ width: '40px' }} />
            <div className="ox-timerbar-wrap">
              <div
                className="ox-timerbar"
                style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* OX 버튼 */}
        {showQuiz && (
          <div className="ox-oxwrap">
            <img
              src="/ox_image/O.png"
              alt="O"
              className={`ox-oximg${myOX === 'O' ? ' ox-oximg-active' : ''}`}
              onClick={() => handleOXClick('O')}
              draggable={false}
              disabled={buttonDisabled}
            />
            <img
              src="/ox_image/X.png"
              alt="X"
              className={`ox-oximg${myOX === 'X' ? ' ox-oximg-active' : ''}`}
              onClick={() => handleOXClick('X')}
              draggable={false}
              disabled={buttonDisabled}
            />
          </div>
        )}

        {/* 캐릭터 및 이펙트 */}
        <div className="ox-charwrap-single">
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
                style={laserFade ? { animation: 'laserDrop 0.5s cubic-bezier(0.7,0,0.5,1), fadeout 0.3s linear', transformOrigin: 'top' } : { transformOrigin: 'top' }}
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

            {/* 캐릭터 이미지 + 이모지 연기/불 효과 */}
            <div style={{ position: 'relative', display: 'inline-block', width: 90, height: 90 }}>
              <img
                src={`/ox_image/char${selectedChar}.png`}
                alt="플레이어1"
                style={{
                  width: '90px',
                  height: '90px',
                  zIndex: 1,
                  position: 'relative',
                  animation: myLife === 1 ? 'criticalShake 0.3s infinite alternate' : 'none'
                }}
              />
              {/* 목숨 2개 이하: 연기 이모지 효과 */}
              {myLife <= 2 && (
                <>
                  <span style={{
                    position: 'absolute',
                    left: 10,
                    top: 40,
                    fontSize: 35,
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'smokeUp 2s infinite linear',
                    opacity: 0.7,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute',
                    left: 50,
                    top: 30,
                    fontSize: 30,
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'smokeUp 2.5s infinite linear 0.8s',
                    opacity: 0.6,
                    filter: 'brightness(0.1) blur(1.5px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute',
                    left: 10,
                    top: 8,
                    fontSize: 25,
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'smokeUp 1.8s infinite linear 1.2s',
                    opacity: 0.5,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute',
                    left: 35,
                    top: 8,
                    fontSize: 25,
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'smokeUp 1.8s infinite linear 1.2s',
                    opacity: 0.5,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                </>
              )}
              {/* 목숨 1개: 불 이모지 효과 */}
              {myLife === 1 && (
                <>
                  <span style={{
                    position: 'absolute',
                    left: -10,
                    top: 15,
                    fontSize: 45,
                    zIndex: 3,
                    pointerEvents: 'none',
                    animation: 'fireFlicker 0.4s infinite alternate'
                  }}>🔥</span>
                  <span style={{
                    position: 'absolute',
                    left: 50,
                    top: 20,
                    fontSize: 40,
                    zIndex: 3,
                    pointerEvents: 'none',
                    animation: 'fireFlicker 0.7s infinite alternate 0.6s'
                  }}>🔥</span>
                </>
              )}
            </div>
            <div className="ox-nick">플레이어1</div>
            <div className="ox-scoreboard ox-scoreboard-single">{myScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(myLife)}
            </div>
          </div>
        </div>

        {/* 카운트다운 오버레이 */}
        {countdown !== null && (
          <div className="ox-countdown-overlay">
            <h1>{countdown}</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default OX_SingleGame;