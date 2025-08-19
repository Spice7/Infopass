import React, { useState, useEffect, useRef, useContext } from "react";
import "./BlankGame.css";
import axios from "axios";
import { LoginContext } from "../../user/LoginContextProvider";
import BlankGameMain from "./BlankGameMain";

const MAX_LIFE = 3;
const TIMER_DURATION = 1800;
const walkImgs = Array.from(
  { length: 16 },
  (_, i) => `/ox_image/walk${i + 1}.png`
);

const BlankGameMulti = () => {
  // 상태 변수 선언
  const [answer, setAnswer] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [quizlist, setquizlist] = useState([]);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const { userInfo } = useContext(LoginContext);
  const [inputDisabled, setInputDisabled] = useState(false);

  // 사용자 정보
  useEffect(() => {
    if (userInfo) {
      console.log("로그인 사용자:", userInfo.id, userInfo.nickname);
    }
  }, [userInfo]);

  const useridx = userInfo?.id;
  const usernickname = userInfo?.nickname;

  // 캐릭터 선택 관련 상태 제거
  const [selectedChar] = useState(1); // 기본 캐릭터(1번)으로 고정

  // 게임 소개 슬라이드 상태 및 데이터 (필요 없으면 제거 가능)
  // ...slides 관련 코드 생략 가능...

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

  // API URL
  const quizurl = "http://localhost:9000/blankgamesingle/blankquizlist";
  const usersubmiturl = "http://localhost:9000/blankgamesingle/submitblankquiz";
  const wronganswerurl =
    "http://localhost:9000/blankgamesingle/blankwronganswer";
  const userstatusurl =
    "http://localhost:9000/blankgamesingle/blankinsertuserstatus";

  // 로딩 애니메이션 후 바로 게임 시작
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame((prev) => (prev + 1) % walkImgs.length);
    }, 180);
    const timer = setTimeout(() => {
      setLoading(false);
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
    }, 1500);
    return () => {
      clearInterval(walkTimer);
      clearTimeout(timer);
    };
  }, [loading]);

  // 타이머 작동
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0.0));
    }, 100);
    return () => clearInterval(timer);
  }, [gameStarted]);

  // 퀴즈 데이터 가져오기
  useEffect(() => {
    axios
      .get(quizurl)
      .then((res) => {
        setquizlist(res.data);
        console.log("퀴즈 데이터 로드 성공:", res.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
      });
  }, [gameStarted]);

  // 하트 렌더링 함수
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? "❤️" : "💔"}
      </span>
    ));

  // 게임 종료 처리 (중복 방지)
  const handleGameEnd = () => {
    if (gameEndedRef.current) return;
    if (myScore < 3) {
      alert("점수가 너무 낮습니다. 다시 시도해주세요.");
    } else {
      alert(`게임 종료! 최종 점수: ${myScore}`);
    }
    gameEndedRef.current = true;
    setGameStarted(false);
    axios
      .post(userstatusurl, {
        user_id: useridx,
        user_score: myScore,
        remain_time: timeLeft,
      })
      .then(() => {
        console.log("사용자 상태 저장 성공");
      });
  };

  // 게임 종료 조건 감지
  useEffect(() => {
    if (gameEndedRef.current) return;
    const allSolved =
      currentindex === quizlist.length - 1 && resultMsg === "정답입니다!";
    const noLife = myLife === 0;
    const noTime = timeLeft <= 0;
    if (gameStarted && (allSolved || noLife || noTime)) {
      setTimeout(() => {
        handleGameEnd();
      }, 500);
    }
  }, [currentindex, resultMsg, myLife, timeLeft, gameStarted, quizlist.length]);

  // OX 버튼 클릭 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputDisabled || !answer.trim()) return;

    setInputDisabled(true);
    const isCorrect =
      answer.trim().toLowerCase() ===
      quizlist[currentindex]?.answer.toLowerCase();

    axios.post(usersubmiturl, {
      user_id: useridx,
      quiz_id: quizlist[currentindex]?.id,
      submitted_answer: answer,
      is_correct: isCorrect,
    });

    if (isCorrect) {
      setResultMsg("정답입니다!");
      setMyScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentindex < quizlist.length - 1) {
          setResultMsg("");
          setcurrentindex((prev) => prev + 1);
          setAnswer("");
          setInputDisabled(false);
        } else {
          handleGameEnd();
        }
      }, 1000);
    } else {
      setResultMsg("오답입니다!");
      setShowMonster(true);

      setTimeout(() => {
        setShowLaser(true);
        setMonsterFade(true);
      }, 800);

      setTimeout(() => {
        setShowBoom(true);
        setLaserFade(true);
      }, 1300);

      setTimeout(() => {
        setBoomFade(true);
        setIsShaking(true);
      }, 1600);

      setTimeout(() => {
        setMyLife((prev) => (prev > 0 ? prev - 1 : 0));
        setShowMonster(false);
        setShowLaser(false);
        setShowBoom(false);
        setIsShaking(false);
        setMonsterFade(false);
        setLaserFade(false);
        setBoomFade(false);

        if (currentindex < quizlist.length - 1) {
          setResultMsg("");
          setcurrentindex((prev) => prev + 1);
          setAnswer("");
          setInputDisabled(false);
        }
      }, 2000);
    }
  };

  // 화면 렌더링

  // 로딩 화면
  if (loading) {
    return (
      <div className="ox-loading">
        <img
          src={walkImgs[walkFrame]}
          alt="로딩중"
          style={{ width: "100px" }}
        />
        로딩중...
      </div>
    );
  }

  // 게임 종료 화면
  if (!gameStarted) {
    return (
      <div className="ox-gameover">
        <h2>{myLife <= 0 ? "GAME OVER" : "CLEAR!"}</h2>
        <p>최종 점수: {myScore}</p>
        <button
          onClick={() => {
            setMyScore(0);
            setMyLife(MAX_LIFE);
            setcurrentindex(0);
            setTimeLeft(TIMER_DURATION);
            setShowQuiz(false);
            setCountdown(null);
            setResultMsg("");
            setShowMonster(false);
            setShowLaser(false);
            setShowBoom(false);
            setIsShaking(false);
            setMonsterFade(false);
            setLaserFade(false);
            setBoomFade(false);
            gameEndedRef.current = false;
            setGameStarted(true); // 바로 게임 시작
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
          }}
        >
          다시 시작
        </button>
      </div>
    );
  }

  // 게임 화면
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1,
      }}
    >
      <div className="ox-container" style={{ display: "block" }}>
        {/* 문제 표시 영역 */}
        <div className="blank-quiz">
          {resultMsg ? (
            <span className="resultMsg">{resultMsg}</span>
          ) : showQuiz && quizlist.length > 0 && quizlist[currentindex] ? (
            <div className="question-wrapper">
              <div className="question-header">
                <span className="question-number">
                  {currentindex + 1}번 문제
                </span>
              </div>
              <div className="question-text">
                {quizlist[currentindex]?.question}
              </div>
              <div className="answer-section">
                <form onSubmit={handleSubmit} className="blank-answer-form">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={inputDisabled}
                    className="blank-input"
                    placeholder="답을 입력하세요"
                  />
                  <button
                    type="submit"
                    disabled={inputDisabled || !answer.trim()}
                    className="submit-btn"
                  >
                    제출
                  </button>
                </form>
              </div>
            </div>
          ) : (
            showQuiz && <p>퀴즈를 불러오는 중입니다...</p>
          )}
        </div>

        {/* 타이머 바 */}
        {showQuiz && (
          <div
            style={{
              display: "flex",
              width: "90%",
              flexWrap: "nowrap",
              position: "absolute",
              top: "4%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
            }}
          >
            <img src="/ox_image/alarm.png" style={{ width: "40px" }} />
            <div className="ox-timerbar-wrap">
              <div
                className="ox-timerbar"
                style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 캐릭터 및 이펙트 */}
        <div className="ox-charwrap-single">
          <div className={`ox-char${isShaking ? " ox-shake" : ""}`}>
            {/* 몬스터 공격 애니메이션 */}
            {showMonster && (
              <img
                src="/ox_image/monster.png"
                alt="monster"
                className="ox-monster"
                style={
                  monsterFade
                    ? {
                        animation:
                          "monsterDrop 0.5s cubic-bezier(0.7,0,0.5,1) forwards, fadeout 0.3s linear",
                      }
                    : {}
                }
                draggable={false}
              />
            )}
            {showLaser && (
              <img
                src="/ox_image/laserYellow1.png"
                alt="laser"
                className="ox-laser"
                style={
                  laserFade
                    ? {
                        animation:
                          "laserDrop 0.5s cubic-bezier(0.7,0,0.5,1), fadeout 0.3s linear",
                        transformOrigin: "top",
                      }
                    : { transformOrigin: "top" }
                }
                draggable={false}
              />
            )}
            {showBoom && (
              <img
                src="/ox_image/laserboom2.png"
                alt="boom"
                className="ox-boom"
                style={
                  boomFade
                    ? { animation: "boomShow 0.4s, fadeout 0.3s linear" }
                    : {}
                }
                draggable={false}
              />
            )}

            {/* 캐릭터 이미지 + 이모지 연기/불 효과 */}
            <div
              style={{
                position: "relative",
                display: "inline-block",
                width: 90,
                height: 90,
              }}
            >
              <img
                src={`/ox_image/char${selectedChar}.png`}
                alt="플레이어1"
                style={{
                  width: "90px",
                  height: "90px",
                  zIndex: 1,
                  position: "relative",
                  animation:
                    myLife === 1
                      ? "criticalShake 0.3s infinite alternate"
                      : "none",
                }}
              />
              {/* 목숨 2개 이하: 연기 이모지 효과 */}
              {myLife <= 2 && (
                <>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 40,
                      fontSize: 35,
                      zIndex: 2,
                      pointerEvents: "none",
                      animation: "smokeUp 2s infinite linear",
                      opacity: 0.7,
                      filter: "brightness(0.1) blur(1px)",
                    }}
                  >
                    💨
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: 50,
                      top: 30,
                      fontSize: 30,
                      zIndex: 2,
                      pointerEvents: "none",
                      animation: "smokeUp 2.5s infinite linear 0.8s",
                      opacity: 0.6,
                      filter: "brightness(0.1) blur(1.5px)",
                    }}
                  >
                    💨
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 8,
                      fontSize: 25,
                      zIndex: 2,
                      pointerEvents: "none",
                      animation: "smokeUp 1.8s infinite linear 1.2s",
                      opacity: 0.5,
                      filter: "brightness(0.1) blur(1px)",
                    }}
                  >
                    💨
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: 35,
                      top: 8,
                      fontSize: 25,
                      zIndex: 2,
                      pointerEvents: "none",
                      animation: "smokeUp 1.8s infinite linear 1.2s",
                      opacity: 0.5,
                      filter: "brightness(0.1) blur(1px)",
                    }}
                  >
                    💨
                  </span>
                </>
              )}
              {/* 목숨 1개: 불 이모지 효과 */}
              {myLife === 1 && (
                <>
                  <span
                    style={{
                      position: "absolute",
                      left: -10,
                      top: 15,
                      fontSize: 45,
                      zIndex: 3,
                      pointerEvents: "none",
                      animation: "fireFlicker 0.4s infinite alternate",
                    }}
                  >
                    🔥
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: 50,
                      top: 20,
                      fontSize: 40,
                      zIndex: 3,
                      pointerEvents: "none",
                      animation: "fireFlicker 0.7s infinite alternate 0.6s",
                    }}
                  >
                    🔥
                  </span>
                </>
              )}
            </div>
            <div className="ox-nick">{usernickname}</div>
            <div className="ox-scoreboard ox-scoreboard-single">{myScore}</div>
            <div className="ox-lifewrap">{renderHearts(myLife)}</div>
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

export default BlankGameMulti;
