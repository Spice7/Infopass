import React, { useState, useEffect, useRef, useContext } from "react";
import "./BlankGame.css";
import axios from "axios";
import { LoginContext } from "../../user/LoginContextProvider";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const MAX_LIFE = 3;
const TIMER_DURATION = 45;
const walkImgs = Array.from(
  { length: 16 },
  (_, i) => `/ox_image/walk${i + 1}.png`
);

const BlankGameMulti = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, quizList, players } = location.state || {};
  const { userInfo } = useContext(LoginContext);

  console.log("🎮 BlankGameMulti 초기 데이터:", {
    roomId,
    quizList,
    quizListLength: quizList?.length,
    players,
    userInfo,
    locationState: location.state,
  });

  // 초기 퀴즈 데이터 설정 - 더 명확하게
  const [quizData, setQuizData] = useState(() => {
    if (quizList && Array.isArray(quizList) && quizList.length > 0) {
      console.log("✅ 초기 퀴즈 데이터 설정:", quizList.length, "개 문제");
      return quizList;
    }
    console.log("⚠️ 초기 퀴즈 데이터 없음, WebSocket으로 대기");
    return [];
  });
  const [answer, setAnswer] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);

  // WebSocket 관련 상태 추가
  const [stompClient, setStompClient] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameResults, setGameResults] = useState([]);

  // 기존 상태들...
  const [selectedChar] = useState(1);
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walkFrame, setWalkFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const gameEndedRef = useRef(false);

  // API URLs
  const usersubmiturl = "http://localhost:9000/blankgamesingle/submitblankquiz";
  const userstatusurl =
    "http://localhost:9000/blankgamesingle/blankinsertuserstatus";

  // WebSocket 연결 설정 수정
  useEffect(() => {
    if (!roomId || !userInfo?.id) return;

    console.log("🔌 BlankGameMulti WebSocket 연결 시도:", roomId);
    console.log("현재 퀴즈 데이터 상태:", {
      quizData: quizData?.length,
      quizList: quizList?.length,
    });

    const client = Stomp.over(
      () => new SockJS("http://localhost:9000/ws-game")
    );

    // 디버그 활성화
    client.debug = (str) => {
      console.log("BlankGame STOMP: " + str);
    };

    client.connect(
      {},
      () => {
        console.log("✅ BlankGameMulti WebSocket 연결 성공");
        setStompClient(client);

        // 게임 시작 메시지 구독 (퀴즈 데이터 수신용)
        const gameStartSubscription = client.subscribe(
          `/topic/game/start/${roomId}`,
          (message) => {
            try {
              console.log(
                "🎮 BlankGameMulti에서 게임 시작 메시지 수신:",
                message.body
              );
              const gameStartData = JSON.parse(message.body);
              console.log("🎮 파싱된 게임 시작 데이터:", gameStartData);

              const { quizList: receivedQuizList, players: gamePlayers } =
                gameStartData;

              if (receivedQuizList && receivedQuizList.length > 0) {
                console.log("📝 퀴즈 데이터 업데이트:", receivedQuizList);
                setQuizData(receivedQuizList);

                // 퀴즈 데이터를 받았으므로 게임 시작 가능
                if (!gameStarted && loading) {
                  console.log("🚀 퀴즈 데이터 수신 완료, 게임 로딩 시작");
                  // 강제로 로딩 상태 재시도
                  setLoading(false);
                  setTimeout(() => setLoading(true), 100);
                }
              } else {
                console.error(
                  "❌ 받은 퀴즈 데이터가 없거나 비어있음:",
                  receivedQuizList
                );
              }

              if (gamePlayers && Array.isArray(gamePlayers)) {
                console.log("👥 플레이어 데이터 업데이트:", gamePlayers);
              }
            } catch (error) {
              console.error(
                "❌ 게임 시작 메시지 파싱 에러:",
                error,
                "원본:",
                message.body
              );
            }
          }
        );

        // 게임 종료 메시지 구독
        const gameEndSubscription = client.subscribe(
          `/topic/game/end/${roomId}`,
          (message) => {
            const endData = JSON.parse(message.body);
            console.log("게임 종료 메시지 수신:", endData);

            if (endData.userId !== userInfo.id) {
              handleGameEndByOther(endData);
            }
          }
        );

        // 게임 결과 집계 메시지 구독
        const gameResultSubscription = client.subscribe(
          `/topic/game/results/${roomId}`,
          (message) => {
            const resultsData = JSON.parse(message.body);
            console.log("게임 결과 수신:", resultsData);
            setGameResults(resultsData.results || []);
            showFinalResults(resultsData.results || []);
          }
        );

        // 구독 정보 저장 (cleanup용)
        client.gameStartSubscription = gameStartSubscription;
        client.gameEndSubscription = gameEndSubscription;
        client.gameResultSubscription = gameResultSubscription;

        console.log("📡 모든 WebSocket 구독 완료");
      },
      (error) => {
        console.error("❌ BlankGameMulti WebSocket 연결 실패:", error);
      }
    );

    return () => {
      if (client && client.connected) {
        console.log("🔌 BlankGameMulti WebSocket 연결 해제");
        try {
          if (client.gameStartSubscription) {
            client.gameStartSubscription.unsubscribe();
          }
          if (client.gameEndSubscription) {
            client.gameEndSubscription.unsubscribe();
          }
          if (client.gameResultSubscription) {
            client.gameResultSubscription.unsubscribe();
          }
          client.disconnect();
        } catch (error) {
          console.error("WebSocket 해제 중 오류:", error);
        }
      }
    };
  }, [roomId, userInfo?.id]); // 의존성에서 gameStarted, loading 제거

  // 초기 검증 수정 - quizList 체크 완화
  useEffect(() => {
    console.log("BlankGameMulti 시작:", {
      roomId,
      quizList,
      quizListLength: quizList?.length,
      players,
      userInfo,
      quizDataLength: quizData?.length,
    });

    if (!roomId) {
      alert("방 정보가 없습니다.");
      navigate("/blankgamelobby");
      return;
    }

    if (!userInfo?.id) {
      alert("사용자 정보가 없습니다.");
      navigate("/login");
      return;
    }

    // 퀴즈 데이터가 있으면 즉시 게임 시작 준비
    if (
      quizList &&
      Array.isArray(quizList) &&
      quizList.length > 0 &&
      quizData.length === 0
    ) {
      console.log("🔄 초기 퀴즈 데이터를 quizData로 복사");
      setQuizData(quizList);
    }

    console.log("게임 데이터 검증 완료");
  }, [roomId, quizList, userInfo, navigate]);

  // 다른 플레이어가 게임을 끝냈을 때 처리
  const handleGameEndByOther = (endData) => {
    if (gameEndedRef.current || gameFinished) return;

    console.log(`${endData.nickname}님이 게임을 종료했습니다.`);
    setGameFinished(true);
    setGameStarted(false);
    gameEndedRef.current = true;

    // 현재 사용자의 결과도 서버에 전송
    sendGameResult("ended_by_other");
  };

  // 최종 결과 화면 표시
  const showFinalResults = (results) => {
    // 점수순으로 정렬
    const sortedResults = results.sort((a, b) => b.score - a.score);

    let resultMessage = "🎮 게임 결과 🎮\n\n";
    sortedResults.forEach((result, index) => {
      const rank = index + 1;
      const medal =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}등`;
      resultMessage += `${medal} ${result.nickname}: ${result.score}점\n`;
    });

    alert(resultMessage);

    setTimeout(() => {
      navigate("/blankgamelobby");
    }, 3000);
  };

  // 게임 결과를 서버에 전송
  const sendGameResult = (endReason = "completed") => {
    if (!stompClient || !stompClient.connected) return;

    const gameResult = {
      userId: userInfo.id,
      nickname: userInfo.nickname,
      roomId: roomId,
      score: myScore,
      life: myLife,
      timeLeft: timeLeft,
      endReason: endReason,
      timestamp: Date.now(),
    };

    stompClient.send("/app/game/end", {}, JSON.stringify(gameResult));
    console.log("게임 결과 전송:", gameResult);
  };

  // 게임 종료 처리 (수정)
  const handleGameEnd = () => {
    if (gameEndedRef.current || gameFinished) return;

    gameEndedRef.current = true;
    setGameFinished(true);
    setGameStarted(false);

    let endReason = "";
    let message = "";
    if (myLife <= 0) {
      endReason = "no_life";
      message = "게임 오버! 생명이 모두 소진되었습니다.";
    } else if (timeLeft <= 0) {
      endReason = "time_out";
      message = "시간 종료! 게임이 끝났습니다.";
    } else {
      endReason = "completed";
      message = `모든 문제 완료! 최종 점수: ${myScore}점`;
    }

    // 다른 플레이어들에게 게임 종료 알림
    sendGameResult(endReason);

    // 사용자 상태 저장
    axios
      .post(userstatusurl, {
        user_id: userInfo.id,
        user_score: myScore,
        remain_time: timeLeft,
        room_id: roomId,
      })
      .then(() => {
        console.log("사용자 상태 저장 성공");
      })
      .catch((error) => {
        console.error("사용자 상태 저장 실패:", error);
      });

    console.log(message);
  };

  // 로딩 애니메이션 후 게임 시작 수정
  useEffect(() => {
    if (!loading) return;

    console.log("🎬 로딩 애니메이션 시작, 퀴즈 데이터 상태:", {
      quizDataLength: quizData?.length,
      quizListLength: quizList?.length,
    });

    const walkTimer = setInterval(() => {
      setWalkFrame((prev) => (prev + 1) % walkImgs.length);
    }, 180);

    const timer = setTimeout(() => {
      // quizData가 있는지 확인
      if (quizData && quizData.length > 0) {
        console.log(
          "✅ 퀴즈 데이터 확인됨, 게임 시작:",
          quizData.length,
          "개 문제"
        );
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
      } else {
        console.log("⏳ 퀴즈 데이터 대기 중...");

        // 초기 quizList가 있는지 다시 확인
        if (quizList && Array.isArray(quizList) && quizList.length > 0) {
          console.log("🔄 초기 quizList 발견, quizData에 설정:", quizList);
          setQuizData(quizList);
          return; // 재시도하지 않고 바로 게임 시작하도록
        }

        // 1초 후 재시도
        setTimeout(() => {
          console.log("🔄 퀴즈 데이터 재시도");
          setLoading(true);
        }, 1000);
      }
    }, 1500);

    return () => {
      clearInterval(walkTimer);
      clearTimeout(timer);
    };
  }, [loading, quizData, quizList]); // quizList 의존성 추가

  // 서버에서 직접 퀴즈 데이터를 가져오는 함수 추가
  const fetchQuizDataDirectly = async () => {
    try {
      console.log("📞 서버에서 직접 퀴즈 데이터 요청");
      const response = await axios.get(
        "http://localhost:9000/blankgamesingle/quizlist"
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        console.log("✅ 직접 요청으로 퀴즈 데이터 획득:", response.data);
        setQuizData(response.data);
      } else {
        console.error(
          "❌ 직접 요청에서도 퀴즈 데이터를 못 받음:",
          response.data
        );
      }
    } catch (error) {
      console.error("❌ 퀴즈 데이터 직접 요청 실패:", error);
    }
  };

  // 퀴즈 데이터 상태 변경 감지
  useEffect(() => {
    console.log("📝 퀴즈 데이터 상태 변경:", {
      quizDataLength: quizData?.length,
      quizListLength: quizList?.length,
      loading,
      gameStarted,
      showQuiz,
    });
  }, [quizData, quizList, loading, gameStarted, showQuiz]);

  // 게임 종료 조건 감지에서도 quizData 사용
  useEffect(() => {
    if (gameEndedRef.current || !gameStarted || !showQuiz || gameFinished)
      return;

    const allSolved =
      currentindex >= quizData.length - 1 && resultMsg === "정답입니다!"; // quizData 사용
    const noLife = myLife === 0;
    const noTime = timeLeft <= 0;

    if (allSolved || noLife || noTime) {
      setTimeout(() => {
        handleGameEnd();
      }, 1000);
    }
  }, [
    currentindex,
    resultMsg,
    myLife,
    timeLeft,
    gameStarted,
    showQuiz,
    quizData.length, // quizData.length 사용
    gameFinished,
  ]);

  // 타이머 작동 (게임이 끝났으면 중단)
  useEffect(() => {
    if (!gameStarted || !showQuiz || gameFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = +(prev - 0.1).toFixed(1);
        return newTime > 0 ? newTime : 0.0;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameStarted, showQuiz, gameFinished]);

  // 하트 렌더링 함수 (기존과 동일)
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? "❤️" : "💔"}
      </span>
    ));

  // 답안 제출 처리 (기존과 동일)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      inputDisabled ||
      !answer.trim() ||
      !quizData[currentindex] ||
      gameFinished
    )
      return;

    setInputDisabled(true);

    const currentQuiz = quizData[currentindex];
    const isCorrect =
      answer.trim().toLowerCase() === currentQuiz.answer.toLowerCase();

    // 서버에 답안 제출
    axios
      .post(usersubmiturl, {
        user_id: userInfo.id,
        quiz_id: currentQuiz.id,
        submitted_answer: answer,
        is_correct: isCorrect,
        room_id: roomId,
      })
      .catch((error) => {
        console.error("답안 제출 실패:", error);
      });

    if (isCorrect) {
      setResultMsg("정답입니다!");
      setMyScore((prev) => prev + 1);

      setTimeout(() => {
        if (currentindex < quizData.length - 1) {
          setResultMsg("");
          setcurrentindex((prev) => prev + 1);
          setAnswer("");
          setInputDisabled(false);
        } else {
          handleGameEnd();
        }
      }, 1500);
    } else {
      setResultMsg("오답입니다!");
      setShowMonster(true);

      // 오답 애니메이션 시퀀스 (기존과 동일)
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
        setMyLife((prev) => Math.max(0, prev - 1));

        setShowMonster(false);
        setShowLaser(false);
        setShowBoom(false);
        setIsShaking(false);
        setMonsterFade(false);
        setLaserFade(false);
        setBoomFade(false);

        if (currentindex < quizData.length - 1 && myLife > 1) {
          setResultMsg("");
          setcurrentindex((prev) => prev + 1);
          setAnswer("");
          setInputDisabled(false);
        } else {
          if (myLife <= 1) {
            handleGameEnd();
          }
        }
      }, 2500);
    }
  };

  // 게임 재시작 (멀티플레이에서는 비활성화)
  const handleRestart = () => {
    alert("멀티플레이 게임에서는 재시작할 수 없습니다. 로비로 돌아가세요.");
  };

  // 방으로 돌아가기
  const handleBackToLobby = () => {
    navigate("/blankgamelobby");
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="ox-loading">
        <img
          src={walkImgs[walkFrame]}
          alt="로딩중"
          style={{ width: "100px" }}
        />
        <p>멀티플레이 게임 준비 중...</p>
        <p>방 번호: {roomId}</p>
        <p>참여자: {players?.length || 0}명</p>
        {quizData?.length > 0 ? (
          <p>퀴즈 로딩 완료: {quizData.length}개 문제</p>
        ) : (
          <p>퀴즈 데이터 대기 중...</p>
        )}
      </div>
    );
  }

  // 게임 종료 화면
  if (!gameStarted || gameFinished) {
    return (
      <div className="ox-gameover">
        <h2>
          {gameFinished
            ? "게임 종료"
            : myLife <= 0
            ? "GAME OVER"
            : timeLeft <= 0
            ? "TIME OVER"
            : "CLEAR!"}
        </h2>
        <p>최종 점수: {myScore}점</p>
        <p>남은 생명: {myLife}</p>
        <p>남은 시간: {timeLeft.toFixed(1)}초</p>

        {gameResults.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3>🏆 최종 순위</h3>
            {gameResults
              .sort((a, b) => b.score - a.score)
              .map((result, index) => (
                <div
                  key={result.userId}
                  style={{ margin: "5px 0", fontSize: "16px" }}
                >
                  {index + 1}등: {result.nickname} - {result.score}점
                </div>
              ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleBackToLobby}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            로비로 돌아가기
          </button>
        </div>
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
        {/* 방 정보 표시 */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          방 #{roomId} | {userInfo?.nickname} | 참여자: {players?.length || 0}명
        </div>

        {/* 게임이 종료되었다는 알림 */}
        {gameFinished && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 0, 0, 0.9)",
              color: "white",
              padding: "20px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              zIndex: 100,
              textAlign: "center",
            }}
          >
            다른 플레이어가 게임을 종료했습니다!
            <br />
            잠시 후 결과를 확인하세요.
          </div>
        )}

        {/* 나머지 게임 UI는 기존과 동일 */}
        {/* 문제 표시 영역 */}
        <div className="blank-quiz">
          {resultMsg ? (
            <span className="resultMsg">{resultMsg}</span>
          ) : showQuiz &&
            quizData.length > 0 &&
            quizData[currentindex] &&
            !gameFinished ? (
            <div className="question-wrapper">
              <div className="question-header">
                <span className="question-number">
                  {currentindex + 1}번 문제 ({currentindex + 1}/
                  {quizData.length})
                </span>
              </div>
              <div className="question-text">
                {quizData[currentindex]?.question}
              </div>
              <div className="answer-section">
                <form onSubmit={handleSubmit} className="blank-answer-form">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={inputDisabled || gameFinished}
                    className="blank-input"
                    placeholder="답을 입력하세요"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={inputDisabled || !answer.trim() || gameFinished}
                    className="submit-btn"
                  >
                    제출
                  </button>
                </form>
              </div>
            </div>
          ) : (
            showQuiz && !gameFinished && <p>퀴즈를 불러오는 중입니다...</p>
          )}
        </div>

        {/* 나머지 UI 컴포넌트들은 기존과 동일 */}
        {/* 타이머 바, 캐릭터, 카운트다운 등... */}
        {showQuiz && !gameFinished && (
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
            <img
              src="/ox_image/alarm.png"
              style={{ width: "40px" }}
              alt="timer"
            />
            <div className="ox-timerbar-wrap">
              <div
                className="ox-timerbar"
                style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 캐릭터 및 이펙트 - 기존과 동일 */}
        <div className="ox-charwrap-single">
          {/* 기존 캐릭터 렌더링 코드 유지 */}
          <div className={`ox-char${isShaking ? " ox-shake" : ""}`}>
            {/* 몬스터 공격 애니메이션 등 기존 코드 유지 */}
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

            {/* 캐릭터 이미지 */}
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
                alt={`플레이어 ${userInfo?.nickname}`}
                style={{
                  width: "90px",
                  height: "90px",
                  zIndex: 1,
                  position: "relative",
                  animation:
                    myLife === 1
                      ? "criticalShake 0.3s infinite alternate"
                      : "none",
                  opacity: gameFinished ? 0.5 : 1,
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
            <div className="ox-nick">{userInfo?.nickname}</div>
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
