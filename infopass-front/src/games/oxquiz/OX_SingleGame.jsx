import React, { useState, useEffect, useRef } from 'react';
import './OX_Quiz.css';
import axios from 'axios';

const MAX_LIFE = 3;
const TIMER_DURATION = 10;
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`);

const OX_SingleGame = () => {
  // =========================
  // 상태 변수 선언
  // 추가로 해야할일
  // - 로그인 시 사용자 정보 가져오기
  // - 게임 종료시 경험치 시스템
  // =========================
  const [myOX, setMyOX] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [quizlist, setquizlist] = useState([]);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // 사용자 정보
  const [userid] = useState('hong@naver.com');
  const [useridx, setuseridx] = useState(0);
  const [usernickname, setusernickname] = useState('');

  // 캐릭터 선택
  const [selectedChar, setSelectedChar] = useState(null);
  const [showCharSelect, setShowCharSelect] = useState(false);

  // 게임 소개 슬라이드 상태 및 데이터
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    {
      img: "/ox_image/guide1.png", // slide1: 제한 시간
      desc: "제한 시간안에 O/X를 선택하여 문제를 푸세요!!"
    },
    {
      img: "/ox_image/guide2.png", // slide2: 외계인 공격
      desc: "문제를 틀리면 외계인이 나타나 공격 하니 주의하세요!!"
    },
    {
      img: "/ox_image/guide3.png", // slide3: 목숨 0개
      desc: "목숨이 0개가 되면 게임이 종료되니 신중히 푸세요!!"
    }
  ];

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

  // 게임 종료 ref
  const gameEndedRef = useRef(false);

  // =========================
  // API URL
  // =========================
  const quizurl = 'http://localhost:9000/oxquiz/quizlist';
  const finduserurl = 'http://localhost:9000/user/finduser';
  const usersubmiturl = 'http://localhost:9000/oxquiz/submitOXquiz';
  const wronganswerurl = 'http://localhost:9000/oxquiz/wronganswer';
  const userstatusurl = 'http://localhost:9000/oxquiz/InsertUserStatus';

  // =========================
  // useEffect: 로딩 애니메이션
  // =========================
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180);
    return () => clearInterval(walkTimer);
  }, [loading]);

  // =========================
  // useEffect: 캐릭터 선택창 띄우기
  // =========================
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCharSelect(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  // =========================
  // 캐릭터 선택 후 카운트다운
  // =========================
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

  // =========================
  // useEffect: 타이머 작동
  // =========================
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0.0));
    }, 100);
    return () => clearInterval(timer);
  }, [gameStarted]);

  // =========================
  // useEffect: 퀴즈 데이터 가져오기
  // =========================
  useEffect(() => {
    axios.get(quizurl)
      .then((res) => {
        setquizlist(res.data);
        console.log("퀴즈 데이터 로드 성공:", res.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
      });
  }, [gameStarted]);

  // =========================
  // useEffect: 사용자 정보 가져오기
  // =========================
  useEffect(() => {
    axios.post(finduserurl, { email: userid })
      .then((res) => {
        setusernickname(res.data.nickname);
        setuseridx(res.data.id);
      })
      .catch((error) => {
        console.error("사용자 정보 에러:", error);
      });
  }, [userid]);

  // =========================
  // 하트 렌더링 함수
  // =========================
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'}
      </span>
    ));

  // =========================
  // 게임 종료 처리 (중복 방지)
  // =========================
  const handleGameEnd = () => {
  if (gameEndedRef.current) return;
  // 점수가 3점 미만일 때 경고 메시지
  if (myScore < 3 ) {
    alert("점수가 너무 낮습니다. 다시 시도해주세요.");
  }else{
  alert(`게임 종료! 최종 점수: ${myScore}`);
  }
  gameEndedRef.current = true;
  setGameStarted(false);
  axios.post(userstatusurl, { user_id: useridx, user_score: myScore, remain_time: timeLeft })
    .then(() => { console.log("사용자 상태 저장 성공") });
};

  // =========================
  // useEffect: 게임 종료 조건 감지
  // =========================
  useEffect(() => {
    if (gameEndedRef.current) return;
    const allSolved = currentindex === quizlist.length - 1 && resultMsg === "정답입니다!";
    const noLife = myLife === 0;
    const noTime = timeLeft <= 0;
    if (gameStarted && (allSolved || noLife || noTime)) {
      setTimeout(() => {
        handleGameEnd();
      }, 500);
    }
  }, [currentindex, resultMsg, myLife, timeLeft, gameStarted, quizlist.length]);

  // =========================
  // OX 버튼 클릭 처리
  // =========================
  const handleOXClick = (ox) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);
    setMyOX(ox);
    const isCorrect = (ox === 'O' && quizlist[currentindex]?.answer === 1) ||
      (ox === 'X' && quizlist[currentindex]?.answer === 0);

    axios.post(usersubmiturl, {
      user_id: useridx, quiz_id: quizlist[currentindex]?.id,
      submitted_answer: ox, is_correct: isCorrect
    });

    if (isCorrect) {
      setResultMsg("정답입니다!");
      if (currentindex === quizlist.length - 1) {
        setMyScore(prev => prev + 1);
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
      axios.post(wronganswerurl,{user_id:useridx,game_type:"oxquiz",
        question_id:quizlist[currentindex]?.id,submitted_answer:ox}).then(()=>{
        console.log("오답 기록 저장 성공");
      })
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
        if (currentindex !== quizlist.length - 1) {
          setcurrentindex(currentindex + 1);
        }
      }, 2000);
    }
  };

  // =========================
  // 화면 렌더링
  // =========================

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
          {/* 게임 소개 슬라이드 */}
          <div className="ox-slide-wrap">
            <div className="ox-slide-imgrow">
              <button
                onClick={() => setSlideIndex((prev) => Math.max(prev - 1, 0))}
                disabled={slideIndex === 0}
                className="ox-slide-arrow-btn left"
                aria-label="이전"
              >
                <span className="ox-slide-arrow">&#9664;</span> {/* ◀ */}
              </button>
              <img
                src={slides[slideIndex].img}
                alt={`slide${slideIndex + 1}`}
                className="ox-slide-img-large"
              />
              <button
                onClick={() => setSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                disabled={slideIndex === slides.length - 1}
                className="ox-slide-arrow-btn right"
                aria-label="다음"
              >
                <span className="ox-slide-arrow">&#9654;</span> {/* ▶ */}
              </button>
            </div>
            <div className="ox-slide-desc oneline">
              {slides[slideIndex].desc}
            </div>
            <div className="ox-slide-indicator">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`ox-slide-dot${slideIndex === idx ? ' active' : ''}`}
                />
              ))}
            </div>
          </div>
          {/* 캐릭터 선택 */}
          <h2>캐릭터를 선택하세요!</h2>
          <div className="ox-charselect-list">
            {[1, 2, 3, 4, 5].map(num => {
              let colorClass = '';
              if (num === 1) colorClass = 'char-basic';
              else if (num === 2) colorClass = 'char-blue';
              else if (num === 3) colorClass = 'char-green';
              else if (num === 4) colorClass = 'char-pink';
              else if (num === 5) colorClass = 'char-yellow';
              return (
                <button
                  key={num}
                  className={`ox-charselect-btn ${colorClass}${selectedChar === num ? ' selected' : ''}`}
                  onClick={() => handleCharSelect(num)}
                  value={num}
                >
                  <img src={`/ox_image/char${num}.png`} alt={`캐릭터${num}`} style={{ width: 80, height: 80 }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 게임 종료 화면
  if (!gameStarted) {
    return (
      <div className="ox-gameover">
        <h2>{myLife <= 0 ? 'GAME OVER' : 'CLEAR!'}</h2>
        <p>최종 점수: {myScore}</p>
        <button onClick={() => {
          setMyScore(0);
          setMyLife(MAX_LIFE);
          setcurrentindex(0);
          setShowCharSelect(true);
          setSelectedChar(null);
          setTimeLeft(TIMER_DURATION);
          setShowQuiz(false);      // 퀴즈 화면 초기화
          setCountdown(null);      // 카운트다운 초기화
          setButtonDisabled(false);// 버튼 활성화
          setResultMsg("");        // 결과 메시지 초기화
          setMyOX(null);           // 선택 초기화
          setShowMonster(false);
          setShowLaser(false);
          setShowBoom(false);
          setIsShaking(false);
          setMonsterFade(false);
          setLaserFade(false);
          setBoomFade(false);
          gameEndedRef.current = false;
          setGameStarted(false);   // 캐릭터 선택부터 다시 시작
        }}>다시 시작</button>
      </div>
    );
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
            <div className="ox-nick">{usernickname}</div>
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