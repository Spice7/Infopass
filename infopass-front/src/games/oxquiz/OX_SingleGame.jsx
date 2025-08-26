import React, { useState, useEffect, useRef, useContext } from 'react';
import './OX_Quiz.css';
import axios from 'axios';
import { LoginContext } from '../../user/LoginContextProvider';
import { useNavigate } from 'react-router-dom';

// ========================================
// 🧩 파일 개요
// - 싱글 플레이 OX 퀴즈 게임 화면 구성
// - 캐릭터 선택 → 카운트다운 → 퀴즈 진행 → 종료 화면 순으로 전개
// - 애니메이션(몬스터, 레이저, 폭발)과 위험 상태(연기/불) 효과 포함
// - 서버와는 REST API로 퀴즈/정답/오답/상태를 주고받음
// ========================================

// =========================
// 상수: 게임 규칙/리소스
// =========================
const MAX_LIFE = 3;                 // 초기 목숨
const TIMER_DURATION = 300;           // 문제당 제한 시간(300초)
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`); // 로딩 애니메이션 프레임

const OX_SingleGame = () => {
  // ===== 상태 변수 그룹 =====
  // =========================
  // 상태 변수 선언 (핵심 게임 상태)
  // - myOX: 내가 선택한 답 (O/X)
  // - myScore: 누적 정답 수
  // - timeLeft: 현재 문제 남은 시간
  // - myLife: 남은 목숨
  // - quizlist/currentindex: 문제 목록과 현재 문제 인덱스
  // - resultMsg: 현재 문제에 대한 결과 메시지
  // - buttonDisabled: 중복 입력 방지 플래그
  // =========================
  const [myOX, setMyOX] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [quizlist, setquizlist] = useState([]);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { userInfo } = useContext(LoginContext);
  const nav = useNavigate();
  // 사용자 정보 로깅 (디버그용)
  useEffect(() => {
    if (userInfo) {
      console.log('로그인 사용자:', userInfo.id, userInfo.nickname);
    }
  }, [userInfo]);

  const useridx = userInfo?.id;              // 로그인 사용자 ID
  const usernickname = userInfo?.nickname;   // 로그인 사용자 닉네임

  // 캐릭터 선택 상태
  const [selectedChar, setSelectedChar] = useState(null);
  const [showCharSelect, setShowCharSelect] = useState(false);

  // 캐릭터 선택 전 보여줄 게임 소개 슬라이드 데이터
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

  // 애니메이션 상태 (몬스터/레이저/폭발 + 화면 흔들림)
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);
  const [showTimeOver, setShowTimeOver] = useState(false); // 타임오버 애니메이션 상태

  // UI 상태 (로딩/카운트다운/퀴즈 표시/게임 시작 여부)
  const [loading, setLoading] = useState(true);
  const [walkFrame, setWalkFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // 중복 종료 방지 ref
  const gameEndedRef = useRef(false);
  // 중복 퀴즈 로드 방지용
  const quizLoadedRef = useRef(false);

  // ===== 외부 연동 상수 =====
  // =========================
  // API URL (백엔드 연동)
  // - 퀴즈 목록 / 사용자 답변 기록 / 오답 기록 / 플레이 상태 저장
  // =========================
  const quizurl = 'http://localhost:9000/oxquiz/quizlist';
  const usersubmiturl = 'http://localhost:9000/oxquiz/submitOXquiz';
  const wronganswerurl = 'http://localhost:9000/oxquiz/wronganswer';
  const userstatusurl = 'http://localhost:9000/oxquiz/InsertUserStatus';

  // ===== 기능(핸들러/보조 함수) 그룹 =====
  // =========================
  // 보조 UI: 하트(목숨) 렌더링
  // =========================
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'}
      </span>
    ));

  // =========================
  // 캐릭터 선택 핸들러: 선택 후 카운트다운 → 퀴즈 시작
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
  // 게임 종료 처리 (중복 방지)
  // - 점수 기준 저장 / 상태 초기화 처리
  // =========================
  const handleGameEnd = () => {
    if (gameEndedRef.current) return;
    // 점수가 3점 이상일 때 
    if (myScore >= 3) {
      axios.post(userstatusurl, { user_id: useridx, user_score: myScore, remain_time: timeLeft })
        .then(() => { console.log("사용자 상태 저장 성공") });
    }
    gameEndedRef.current = true;
    setGameStarted(false);

  };

  // =========================
  // 정답 제출 핸들러
  // - 클릭 시 중복 입력 방지 → 정오 판정 → 애니메이션/점수/목숨 처리 → 다음 문제 준비
  // - 정답/오답 기록은 서버에 즉시 전송
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
      axios.post(wronganswerurl, {
        user_id: useridx, game_type: "oxquiz",
        question_id: quizlist[currentindex]?.id, submitted_answer: ox
      }).then(() => {
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

  // ===== 이펙트 그룹 =====
  // =========================
  // useEffect: 로딩 애니메이션 (로딩 중 걷기 프레임 순환)
  // =========================
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180);
    return () => clearInterval(walkTimer);
  }, [loading]);

  // =========================
  // useEffect: 캐릭터 선택창 오픈 (로딩 종료 후 1.5초)
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
  // useEffect: 문제 제한시간 타이머(0.1초 단위 감소)
  // =========================
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0.0));
    }, 100);
    return () => clearInterval(timer);
  }, [gameStarted]);

  // =========================
  // useEffect: 퀴즈 데이터 로드(게임 시작 시 1회)
  // =========================
  useEffect(() => {
    if(!gameStarted) return;

    quizLoadedRef.current = true;
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
  // useEffect: 게임 종료 조건 감지
  // - 모든 문제 풀이 / 목숨 소진 / 제한시간 초과
  // =========================
  useEffect(() => {
    if (gameEndedRef.current || !gameStarted) return;

    const allSolved = currentindex === quizlist.length - 1 && resultMsg === "정답입니다!";
    const noLife = myLife === 0;

    // 승리 또는 패배 조건
    if (allSolved || noLife) {
      setTimeout(() => {
        handleGameEnd();
      }, 500);
      return;
    }

    const noTime = timeLeft <= 0;
    if (noTime) {
      // 타임오버 애니메이션 → 게임 종료
      setTimeout(() => {
        setShowTimeOver(true);
        setButtonDisabled(true);
      }, 150);
      setTimeout(() => {
        setShowTimeOver(false);
        handleGameEnd();
      }, 3000);
    }
  }, [currentindex, resultMsg, myLife, timeLeft, gameStarted, quizlist.length]);

  // =========================
  // 화면 렌더링
  // =========================

  // 공통 레이아웃 클래스 (.ox-stage / .ox-stage-loading) 사용

  // 로딩 화면 (크기/z-index OX_main과 통일)
  if (loading) {
    return (
      <div className="ox-stage-loading">
        <div className="ox-loading-scroll">
          <img src="/ox_image/002.png" alt="bg" />
          <img src="/ox_image/002.png" alt="bg" />
        </div>
        <div className="ox-loading-inner">
          <img src={walkImgs[walkFrame]} alt="로딩중" style={{ width: '110px' }} />
          <div style={{ marginTop: 18 }}>로딩중...</div>
        </div>
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
      <div style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {/* 축하/아쉬움 이펙트 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {/* 별/트로피/파티콘 이모지 애니메이션 */}
          <div style={{
            position: 'absolute', left: '10%', top: '12%', fontSize: 48, 
            animation: 'fadeInUp 1.2s',
          }}>{myScore < 3 || myLife <= 0 ? '💀' : '🏆'}</div>
          <div style={{
            position: 'absolute', left: '82%', top: '12%', fontSize: 58,
            animation: 'fadeInUp 1.5s',
          }}>{myScore < 3 || myLife <= 0 ? '😵' : '🎉'}</div>
          <div style={{
            position: 'absolute', left: '48%', top: '8%', fontSize: 60,
            animation: 'fadeInUp 1.1s',
          }}>{myScore < 3 || myLife <= 0 ? '☠️' : '⭐'}</div>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
        <div style={{
          backgroundImage: 'url(/ox_image/002.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 28,
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          padding: '54px 48px 44px 48px',
          minWidth: 340,
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
          position: 'relative',
        }}>
          {/* 타이틀 */}
          <div style={{
            fontSize: 44,
            fontWeight: 900,
            color: myLife <= 0 ? '#ff7675' : '#ffe066',
            textShadow: '2px 2px 12px #22344f',
            marginBottom: 12,
            letterSpacing: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            animation: 'popIn 0.7s',
          }}>
            {myScore < 3 || myLife <= 0 ? '💀 GAME OVER' : '🏆 CLEAR!'}
          </div>
          {/* 캐릭터/트로피/별/몬스터 */}
          <div style={{ marginBottom: 18, position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={myScore < 3 || myLife <= 0 ? '/ox_image/monster.png' : `/ox_image/char${selectedChar}.png`}
              alt={myScore < 3 || myLife <= 0 ? 'monster' : 'trophy'}
              style={{ width: 90, height: 90, filter: myScore < 3 || myLife <= 0 ? 'grayscale(0.7)' : 'drop-shadow(0 0 12px #ffe066)' }}
            />

          </div>
          {/* 점수 카드 */}
          <div style={{
            background: 'linear-gradient(90deg, #7fd8ff 0%, #ffe066 100%)',
            borderRadius: 18,
            boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
            padding: '18px 38px',
            fontSize: 28,
            fontWeight: 800,
            color: '#22344f',
            marginBottom: 18,
            // display: 'flex',
            alignItems: 'center',
            gap: 12,
            letterSpacing: 1,
          }}>
            {/* ✅ 수정된 부분: 각 분기를 Fragment(<>)로 감싸서 하나의 요소로 만듭니다. */}
            {myScore < 3 ? (
              <>
                <span role="img" aria-label="score">💀</span>
                <span style={{ color: 'red', fontSize: '0.85rem' }}>
                  낮은 점수는 기록이 되지 않습니다.
                </span>
                <br />최종 점수: {myScore}
              </>
            ) : (
              <>
                <span role="img" aria-label="score">⭐</span>
                {`최종 점수: ${myScore}`}
              </>
            )}
          </div>
          {/* 다시 시작 버튼 */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
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
            }}
            style={{
              marginTop: 10,
              borderRadius: 12,
              border: 'none',
              fontWeight: 800,
              fontSize: 22,
              background: 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)',
              color: '#22344f',
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s',
              letterSpacing: 1,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #7fd8ff 0%, #ffe066 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)'}
          >
            다시 시작
          </button>
          <button onClick={() => nav(-1)} style={{
              marginTop: 10,
              borderRadius: 12,
              border: 'none',
              fontWeight: 800,
              fontSize: 22,
              background: 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)',
              color: '#22344f',
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s',
              letterSpacing: 1,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #7fd8ff 0%, #ffe066 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)'}
            >
              뒤로가기</button>
        </div>
        </div>
        {/* 타임오버 애니메이션 오버레이 */}
        {showTimeOver && (
          <div style={{
            position: 'fixed',
            left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(20,30,50,0.55)',
            zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#ffe066',
              textShadow: '2px 2px 18px #22344f',
              animation: 'timeOverPop 1.1s',
              padding: '32px 60px',
              borderRadius: 24,
              background: 'rgba(34,52,79,0.97)',
              border: '3px solid #ffe066',
            }}>
              ⏰ TIME OVER!
            </div>
            <style>{`
              @keyframes timeOverPop {
                0% { opacity: 0; transform: scale(0.7); }
                60% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
    );
  }

  // 게임 화면
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="ox-stage">
        {/* 문제 영역 */}
        <div className="ox-quiz">
          {resultMsg ? <span className='resultMsg'>{resultMsg}</span> : (showQuiz ? currentindex + 1 + ". " + quizlist[currentindex]?.question : "")}
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
      {/* showTimeOver이 true면 오버레이 (전역) */}
      {showTimeOver && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(20,30,50,0.55)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
        }}>
          <div style={{ fontSize: 60, fontWeight: 900, color: '#ffe066', textShadow: '2px 2px 18px #22344f', animation: 'timeOverPop 1.1s', padding: '32px 60px', borderRadius: 24, background: 'rgba(34,52,79,0.97)', border: '3px solid #ffe066' }}>⏰ TIME OVER!</div>
        </div>
      )}
    </div>
  );
};

export default OX_SingleGame;