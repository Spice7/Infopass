import React, { useState, useEffect, useRef, useContext } from 'react';
import './OX_Quiz.css';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { LoginContext } from '../../user/LoginContextProvider';

const MAX_LIFE = 3;
const TIMER_DURATION = 5;
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`);

const OX_MultiGame = () => {
  // 상태 변수
  const [myOX, setMyOX] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [quizlist, setquizlist] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [correctOX, setCorrectOX] = useState(null);
  const [gameResult, setGameResult] = useState(null); // 'WIN', 'LOSE', 'DRAW'
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);

  const { userInfo } = useContext(LoginContext);

  // 로그인 사용자
  useEffect(() => {
    if (userInfo) {
      console.log('로그인 사용자:', userInfo.id, userInfo.nickname);
    }
  }, [userInfo]);
  const useridx = userInfo?.id;
  const usernickname = userInfo?.nickname;

  // 상대방 정보
  const [enemynickname, setEnemynickname] = useState('상대방닉네임');
  const [enemyidx, setEnemyidx] = useState(null);
  const [enemyOX, setEnemyOX] = useState(null);
  const [enemyScore, setEnemyScore] = useState(0);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);

  // 애니메이션 상태 변수 (나)
  const [showMyMonster, setShowMyMonster] = useState(false);
  const [showMyLaser, setShowMyLaser] = useState(false);
  const [showMyBoom, setShowMyBoom] = useState(false);
  const [myMonsterFade, setMyMonsterFade] = useState(false);
  const [myLaserFade, setMyLaserFade] = useState(false);
  const [myBoomFade, setMyBoomFade] = useState(false);
  const [isShaking, setIsShaking] = useState(false);


  // 상대 피격 연출
  // 애니메이션 상태 변수 (상대)
  const [enemyMonsterFade, setEnemyMonsterFade] = useState(false);
  const [enemyLaserFade, setEnemyLaserFade] = useState(false);
  const [enemyBoomFade, setEnemyBoomFade] = useState(false);
  const [showEnemyBoom, setShowEnemyBoom] = useState(false);
  const [showEnemyMonster, setShowEnemyMonster] = useState(false);
  const [showEnemyLaser, setShowEnemyLaser] = useState(false);

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [walkFrame, setWalkFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // 캐릭터 선택
  const [selectedChar, setSelectedChar] = useState(null);
  const [enemySelectedChar, setEnemySelectedChar] = useState(null);
  const [takenChars, setTakenChars] = useState(new Set());     // 선택된 번호 집합
  const [showCharSelect, setShowCharSelect] = useState(false);

  // 종료 ref
  const gameEndedRef = useRef(false);

  // 정답 공개(reveal) 중복 요청 방지
  const revealSentRef = useRef(false);

  // ==================================================
  // ✅ 1. 최신 상태를 담을 useRef "라이브 포인터" 생성
  // ==================================================
  const stateRef = useRef({
    myLife,
    enemyLife,
    quizlist,
    currentindex,
  });

  // ✅ 2. 상태가 변경될 때마다 "라이브 포인터"의 내용물을 업데이트
  useEffect(() => {
    stateRef.current = {
      myLife,
      enemyLife,
      quizlist,
      currentindex,
    };
  }, [myLife, enemyLife, quizlist, currentindex]);

  // API URL
  const usersubmiturl = 'http://localhost:9000/oxquiz/submitOXquiz';
  const wronganswerurl = 'http://localhost:9000/oxquiz/wronganswer';
  const lobbyendedurl = 'http://localhost:9000/oxquiz/EndGame';

  // 로딩 애니메이션
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180);
    return () => clearInterval(walkTimer);
  }, [loading]);

  // 캐릭터 선택창 띄우기
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setShowCharSelect(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  // 캐릭터 선택
  const roomId = useRef(new URLSearchParams(window.location.search).get('roomId') || null).current;
  const handleCharSelect = (num) => {
    if (takenChars.has(num)) return;         // 이미 점유
    setSelectedChar(num);                    // 낙관적 표시
    if (stompClient && stompClient.connected && roomId) {
      stompClient.publish({
        destination: '/app/ox/room.char',
        body: JSON.stringify({
          type: 'char',
          roomId: +roomId,
          userId: useridx,
          nickname: usernickname,
          charNo: num
        })
      });
    }
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
  // useEffect: 타이머 0초 처리
  // =========================
  useEffect(() => {
    if (timeLeft <= 0 && gameStarted && !revealSentRef.current) {
      setButtonDisabled(true); // 버튼 비활성화

      // 서버에 정답 공개 요청
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/ox/room.reveal',
          body: JSON.stringify({
            type: 'reveal',
            roomId: +roomId,
            qIndex: currentindex,
          }),
        });
      }
    }
  }, [timeLeft, gameStarted, stompClient, roomId, currentindex]);

  // 웹소켓 연결
  useEffect(() => {
    console.log(`[WEBSOCKET] 연결 시도. Room ID: ${roomId}, User ID: ${useridx}`);

    // roomId나 useridx가 없으면 연결 시도조차 하지 않음
    if (!roomId || !useridx) return;

    const socket = new SockJS('http://localhost:9000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      reconnectDelay: 5000
    });

    let roomSub; // 방 토픽 구독 핸들

    client.onConnect = () => {
      if (roomId) {
        roomSub = client.subscribe(`/topic/ox/room.${roomId}`, (message) => {
          const data = JSON.parse(message.body);

          if (data.type === 'room') {
            const players = data.players || [];
            const others = players.filter(p => String(p.userId) !== String(useridx));
            if (others.length > 0) {
              setEnemynickname(others[0].nickname || '상대방');
              setEnemyidx(others[0].userId);
            }
          }

          if (data.type === 'char') {
            // taken: [1,2,...], selections: { userId: charNo }
            const t = new Set(data.taken || []);
            setTakenChars(t);
            const myNo = data.selections?.[String(useridx)] ?? null;
            const otherEntry = Object.entries(data.selections || {})
              .find(([uid]) => String(uid) !== String(useridx));
            setSelectedChar(prev => (myNo ?? prev));
            setEnemySelectedChar(otherEntry ? otherEntry[1] : null);
          }

          if (data.type === 'charDenied') {
            if (String(data.userId) === String(useridx)) {
              alert('이미 선택된 캐릭터입니다.');
              setSelectedChar(null);
            }
          }

          // 서버가 동일 문제 세트/시작시각을 전송
          if (data.type === 'quizSet') {
            const now = Date.now();
            const startAt = Number(data.startAt || now + 3000);
            const sec = Math.max(0, Math.ceil((startAt - now) / 1000));
            const duration = Number(data.duration || TIMER_DURATION);


            setquizlist(data.quizList || []);
            setcurrentindex(0);

            // 카운트다운 동안 선택 화면 유지
            setCountdown(sec);
            setGameStarted(true);

            let c = sec;
            const iv = setInterval(() => {
              c -= 1;
              if (c <= 0) {
                clearInterval(iv);
                setCountdown(null);
                setShowCharSelect(false);
                setShowQuiz(true);
                setTimeLeft(duration);
              } else {
                setCountdown(c);
              }
            }, 1000);
          }

          // 서버로부터 정답 및 결과 수신
          if (data.type === 'reveal') {
            if (revealSentRef.current) {
              console.log("이미 처리중")
              return;
            }
            revealSentRef.current = true;
            const myResult = data.results[String(useridx)];
            const enemyId = Object.keys(data.results).find(id => id !== String(useridx));
            const enemyResult = enemyId ? data.results[enemyId] : null;
            const isCorrect = myResult.result === 'correct';
            setCorrectOX(data.correctAnswer);
            setShowCorrectOverlay(true);
            setButtonDisabled(true);

            // ==================================================
            // 내 결과 처리 (싱글 플레이 로직 적용)
            // ==================================================
            if (myResult) {
              setMyOX(myResult.submitted);
              const currentQuizId = data.QList[data.qIndex]?.id;
              console.log(currentQuizId);
              // 내 답안 DB제출
              axios.post(usersubmiturl, {
                user_id: useridx, quiz_id: currentQuizId,
                submitted_answer: myResult.submitted, is_correct: isCorrect
              }).then((res) => { console.log("내 답안 제출 성공", res.data) }).catch((err) => {
                console.error("내 답안 제출 실패", err);
              });

              if (isCorrect) {
                setResultMsg("정답입니다!");
                setMyScore(prev => prev + 10);
              } else {
                setResultMsg("오답입니다!");
                // 오답 기록 DB저장
                axios.post(wronganswerurl, {
                  user_id: useridx, game_type: "oxquiz",
                  question_id: currentQuizId, submitted_answer: myResult.submitted
                }).then(() => {
                  console.log("오답 기록 저장 성공");
                })

                // 내 캐릭터 피격 애니메이션
                setShowMyMonster(true); // 내 몬스터 등장
                setTimeout(() => setShowMyLaser(true), 800);
                setTimeout(() => {
                  setShowMyBoom(true);
                  setIsShaking(true); // 화면 흔들림
                  setMyLife(prev => Math.max(0, prev - 1));
                }, 1200);
                setTimeout(() => {
                  setMyMonsterFade(true);
                  setMyLaserFade(true);
                  setMyBoomFade(true);
                }, 1700);
              }
            }

            // ==================================================
            // 상대 결과 처리 (애니메이션 적용)
            // ==================================================
            if (enemyResult) {
              setEnemyOX(enemyResult.submitted);
              if (enemyResult.result === 'correct') {
                setEnemyScore(prev => prev + 10);
              } else {
                // 상대 캐릭터 피격 애니메이션
                setShowEnemyMonster(true); // 상대 몬스터 등장
                setTimeout(() => setShowEnemyLaser(true), 800);
                setTimeout(() => {
                  setShowEnemyBoom(true);
                  setEnemyLife(prev => Math.max(0, prev - 1));
                }, 1200);
                setTimeout(() => {
                  setEnemyMonsterFade(true);
                  setEnemyLaserFade(true);
                  setEnemyBoomFade(true);
                }, 1700);
              }
            }

            // ==================================================
            // 다음 문제로 넘어가는 타이머 (애니메이션 시간 고려)
            // ==================================================
            setTimeout(() => {
              // ✅ 3. 오래된 상태 대신, 항상 최신 값을 가리키는 ref에서 값을 가져옵니다.
              const { quizlist, currentindex, myLife, enemyLife } = stateRef.current;

              const nextIndex = currentindex + 1;

              console.log("nextIndex:", nextIndex, "totalQuizCount:", quizlist.length);
              console.log("myLife:", myLife, "enemyLife:", enemyLife);

              if (nextIndex < quizlist.length && myLife > 0 && enemyLife > 0) {
                // 상태 초기화
                setcurrentindex(nextIndex);
                setMyOX(null);
                setEnemyOX(null);
                setShowCorrectOverlay(false);
                setButtonDisabled(false);
                setResultMsg("");
                setTimeLeft(TIMER_DURATION);
                revealSentRef.current = false;

                // 모든 애니메이션 관련 상태 초기화
                setShowMyMonster(false);
                setShowMyLaser(false);
                setShowMyBoom(false);
                setMyMonsterFade(false);
                setMyLaserFade(false);
                setMyBoomFade(false);
                setShowEnemyMonster(false);
                setShowEnemyLaser(false);
                setShowEnemyBoom(false);
                setEnemyMonsterFade(false);
                setEnemyLaserFade(false);
                setEnemyBoomFade(false);
                setIsShaking(false);
              } else {
                // ==================================================
                // ✅ 2. 게임 종료 조건 판별 및 결과 설정
                // ==================================================
                gameEndedRef.current = true;

                // 최종 라이프와 점수를 기준으로 승패 판정
                const finalMyLife = stateRef.current.myLife;
                const finalEnemyLife = stateRef.current.enemyLife;

                if (finalMyLife <= 0 && finalEnemyLife > 0) {
                  setGameResult('LOSE');
                } else if (finalMyLife > 0 && finalEnemyLife <= 0) {
                  setGameResult('WIN');
                } else if (finalMyLife <= 0 && finalEnemyLife <= 0) {
                  // 둘 다 죽었을 경우 점수로 판정
                  setGameResult('DRAW');
                } else {
                  // 모든 문제를 풀었을 경우 (둘 다 살아있음)
                  if (finalMyLife > finalEnemyLife) setGameResult('WIN');
                  else if (finalMyLife < finalEnemyLife) setGameResult('LOSE');
                  else setGameResult('DRAW');
                }

                axios.post
              }
            }, 3000); // 3초 후 다음 문제
          }

        });

        // 방 스냅샷 요청
        client.publish({
          destination: '/app/ox/room.info',
          body: JSON.stringify({ type: 'info', roomId: +roomId })
        });
      }
    };

    client.activate();
    setStompClient(client);

    // ==================================================
    // ✅ [핵심] 뒷정리(Cleanup) 함수 추가
    // ==================================================
    return () => {
      console.log("[WEBSOCKET] 뒷정리 함수 실행. 연결을 종료합니다.");
      if (roomSub) {
        try {
          roomSub.unsubscribe();
          console.log("[WEBSOCKET] 구독 취소 완료.");
        } catch (e) {
          console.error("구독 취소 중 오류 발생:", e);
        }
      }
      if (client && client.active) {
        try {
          // 퇴장 메시지는 선택적으로 보낼 수 있습니다.
          client.publish({
            destination: '/app/ox/room.leave',
            body: JSON.stringify({ type: 'leave', roomId: +roomId, userId: useridx }),
          });
          client.deactivate();
          console.log("[WEBSOCKET] 연결 종료 완료.");
        } catch (e) {
          console.error("연결 종료 중 오류 발생:", e);
        }
      }
    };
  }, [roomId, useridx]); // 의존성 배열은 그대로 유지

  // OX 클릭 → 내 답 전송
  const handleOXClick = (ox) => {
    if (buttonDisabled) return;
    setMyOX(ox);

    if (stompClient && stompClient.connected && roomId) {
      const payload = {
        type: 'answer',
        roomId: +roomId,
        userId: useridx,
        qIndex: currentindex,
        answer: ox, // 'O' or 'X'
      };

      // [디버깅 로그 추가] 전송 직전의 데이터 객체와 JSON 문자열을 모두 확인
      console.log('[PUBLISH_DATA] Payload Object:', payload);
      const jsonBody = JSON.stringify(payload);
      console.log('[PUBLISH_DATA] JSON Body:', jsonBody);

      stompClient.publish({
        destination: '/app/ox/room.answer',
        body: jsonBody,
      });
    }
  };

  // 하트 렌더링
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'}
      </span>
    ));

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
          <h1>OX 퀴즈 멀티플레이어</h1>
          <h2>캐릭터를 선택하세요!</h2>
          <div className="ox-charselect-list">
            {[1, 2, 3, 4, 5].map(num => {
              const isTaken = takenChars.has(num);
              const isMine = selectedChar === num;
              const isEnemy = enemySelectedChar === num;
              let colorClass = '';
              if (num === 1) colorClass = 'char-basic';
              else if (num === 2) colorClass = 'char-blue';
              else if (num === 3) colorClass = 'char-green';
              else if (num === 4) colorClass = 'char-pink';
              else if (num === 5) colorClass = 'char-yellow';
              return (
                <div key={num} style={{ position: 'relative' }}>
                  <button
                    className={`ox-charselect-btn ${colorClass}${isMine ? ' selected' : ''}`}
                    onClick={() => handleCharSelect(num)}
                    disabled={isTaken && !isMine}
                    style={{
                      filter: isTaken && !isMine ? 'grayscale(100%) brightness(0.6)' : 'none',
                      cursor: isTaken && !isMine ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <img src={`/ox_image/char${num}.png`} alt={`캐릭터${num}`} style={{ width: 80, height: 80 }} />
                  </button>
                  {isMine && (
                    <div style={{ position: 'absolute', width: '100%', textAlign: 'center', top: 90, color: 'black', fontSize: '25px' }}>
                      {usernickname}
                    </div>
                  )}
                  {isEnemy && (
                    <div style={{ position: 'absolute', width: '100%', textAlign: 'center', top: 90, color: 'black', fontSize: '25px' }}>
                      {enemynickname}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {countdown !== null && (
            <div className="ox-countdown-overlay">
              <h1>{countdown}</h1>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================================================
  // 게임 종료 화면
  // ==================================================
  if (gameResult) {
    let resultText = '';
    let resultClass = '';
    if (gameResult === 'WIN') {
      resultText = '승리!';
      resultClass = 'win';
    } else if (gameResult === 'LOSE') {
      resultText = '패배';
      resultClass = 'lose';
    } else {
      resultText = '무승부';
      resultClass = 'draw';
    }

    return (
      <div className="ox-gameover-overlay">
        <div className={`ox-gameover-box ${resultClass}`}>
          <h1 className="ox-gameover-title">{resultText}</h1>
          <div className="ox-gameover-scores">
            <div className="ox-gameover-player">
              <h2>{usernickname}</h2>
              <p>{myScore}점</p>
            </div>
            <div className="ox-gameover-player">
              <h2>{enemynickname}</h2>
              <p>{enemyScore}점</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/lobby'} className="ox-gameover-btn">
            로비로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ================
  // 게임 화면
  // ================
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
      zIndex: 1
    }}>
      <div className="ox-container">
        {/* 문제 */}
        <div className="ox-quiz">
          {showCorrectOverlay ? (
            <span className="resultMsg">정답은 <b>{correctOX}</b> 입니다!!!</span>
          ) : resultMsg ? (
            <span className="resultMsg">{resultMsg}</span>
          ) : (
            showQuiz ? `${currentindex + 1}. ${quizlist[currentindex]?.question}` : ''
          )}
        </div>

        {/* 타이머 */}
        {showQuiz && (
          <div style={{
            display: 'flex',
            width: '90%',
            position: 'absolute',
            top: '4%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5
          }}>
            <img src="/ox_image/alarm.png" style={{ width: '40px' }} />
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

        {/* 캐릭터 영역 */}
        <div className="ox-charwrap">
          {/* 내 캐릭터 */}
          <div className={`ox-char${isShaking ? ' ox-shake' : ''}`}>
            {showMyMonster && (
              <img
                src="/ox_image/monster.png"
                alt="monster"
                className="ox-monster"
                style={myMonsterFade ? { animation: 'monsterDrop 0.5s cubic-bezier(0.7,0,0.5,1) forwards, fadeout 0.3s linear' } : {}}
                draggable={false}
              />
            )}
            {showMyLaser && (
              <img
                src="/ox_image/laserYellow1.png"
                alt="laser"
                className="ox-laser"
                style={myLaserFade ? { animation: 'laserDrop 0.5s cubic-bezier(0.7,0,0.5,1), fadeout 0.3s linear', transformOrigin: 'top' } : { transformOrigin: 'top' }}
                draggable={false}
              />
            )}
            {showMyBoom && (
              <img
                src="/ox_image/laserboom2.png"
                alt="boom"
                className="ox-boom"
                style={myBoomFade ? { animation: 'boomShow 0.4s, fadeout 0.3s linear' } : {}}
                draggable={false}
              />
            )}
            {myOX && (
              <div className="ox-oxabove">
                <img
                  src={myOX === "O" ? '/ox_image/O.png' : '/ox_image/X.png'}
                  alt={myOX}
                  style={{ width: 60, height: 70 }}
                  draggable={false}
                />
              </div>
            )}
            <div style={{ position: 'relative', display: 'inline-block', width: 90, height: 90 }}>
              <img
                src={`/ox_image/char${selectedChar}.png`}
                alt="플레이어1"
                style={{
                  width: 90,
                  height: 90,
                  zIndex: 1,
                  position: 'relative',
                  animation: myLife === 1 ? 'criticalShake 0.3s infinite alternate' : 'none'
                }}
              />
              {myLife <= 2 && (
                <>
                  <span style={{
                    position: 'absolute', left: 10, top: 40, fontSize: 35,
                    animation: 'smokeUp 2s infinite linear', opacity: 0.7,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute', left: 50, top: 30, fontSize: 30,
                    animation: 'smokeUp 2.5s infinite linear 0.8s', opacity: 0.6,
                    filter: 'brightness(0.1) blur(1.5px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute', left: 10, top: 8, fontSize: 25,
                    animation: 'smokeUp 1.8s infinite linear 1.2s', opacity: 0.5,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                  <span style={{
                    position: 'absolute', left: 35, top: 8, fontSize: 25,
                    animation: 'smokeUp 1.8s infinite linear 1.2s', opacity: 0.5,
                    filter: 'brightness(0.1) blur(1px)'
                  }}>💨</span>
                </>
              )}
              {myLife === 1 && (
                <>
                  <span style={{
                    position: 'absolute', left: -10, top: 15, fontSize: 45,
                    animation: 'fireFlicker 0.4s infinite alternate'
                  }}>🔥</span>
                  <span style={{
                    position: 'absolute', left: 50, top: 20, fontSize: 40,
                    animation: 'fireFlicker 0.7s infinite alternate 0.6s'
                  }}>🔥</span>
                </>
              )}
            </div>
            <div className="ox-nick">{usernickname}</div>
            <div className="ox-scoreboard">{myScore}</div>
            <div className="ox-lifewrap">{renderHearts(myLife)}</div>
          </div>

          {/* 상대방 */}
          <div className="ox-char">
            {showEnemyMonster && (
              <img
                src="/ox_image/monster.png"
                alt="enemy-monster"
                className="ox-monster"
                draggable={false}
              />
            )}
            {showEnemyLaser && (
              <img
                src="/ox_image/laserYellow1.png"
                alt="enemy-laser"
                className="ox-laser"
                style={{ transformOrigin: 'top' }}
                draggable={false}
              />
            )}
            <img src={`/ox_image/char${enemySelectedChar}.png`} alt="플레이어2" style={{ width: 90, height: 90 }} />
            <div className="ox-nick">{enemynickname}</div>
            <div className="ox-scoreboard">{enemyScore}</div>
            <div className="ox-lifewrap">{renderHearts(enemyLife)}</div>
            {enemyOX && (
              <div className="ox-oxabove">
                <img
                  src={enemyOX === "O" ? '/ox_image/O.png' : '/ox_image/X.png'}
                  alt={enemyOX}
                  style={{ width: 60, height: 70 }}
                  draggable={false}
                />
              </div>
            )}
            {showEnemyBoom && (
              <img
                src="/ox_image/laserboom2.png"
                alt="enemyBoom"
                className="ox-boom"
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* 카운트다운 */}
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