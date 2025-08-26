import React, { useState, useEffect, useRef, useContext } from 'react';
import './OX_Quiz.css';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { LoginContext } from '../../user/LoginContextProvider';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../user/RequireLogin';

// ========================================
// 🧩 파일 개요
// - 멀티플레이 OX 퀴즈 게임 화면 구성
// - 로비에서 방 입장 → 캐릭터 선택 → 동기화된 퀴즈/타이머 → 정답 공개/피격 연출 → 종료/결과 화면
// - WebSocket(STOMP)으로 룸 상태/문제/정답/선택 동기화, REST API로 결과/기록 저장
// - 나/상대 각각 애니메이션(몬스터/레이저/폭발), 위험 상태(연기/불) 효과 제공
// ========================================

// ===== 상수 그룹 =====
const MAX_LIFE = 3; // 초기 목숨
const TIMER_DURATION = 5; // 문제 제한 시간(초)
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`); // 로딩 프레임

const OX_MultiGame = () => {
  // ===== 상태 변수 그룹 =====
  // 내 상태
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
  const navigate = useNavigate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: "", message: "" });
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
  const [setEnemyidx] = useState(null);
  const [enemyOX, setEnemyOX] = useState(null);
  const [enemyScore, setEnemyScore] = useState(0);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);

  // 애니메이션 상태 (나)
  const [showMyMonster, setShowMyMonster] = useState(false);
  const [showMyLaser, setShowMyLaser] = useState(false);
  const [showMyBoom, setShowMyBoom] = useState(false);
  const [myMonsterFade, setMyMonsterFade] = useState(false);
  const [myLaserFade, setMyLaserFade] = useState(false);
  const [myBoomFade, setMyBoomFade] = useState(false);
  const [isShaking, setIsShaking] = useState(false);


  // 애니메이션 상태 (상대)
  const [enemyMonsterFade, setEnemyMonsterFade] = useState(false);
  const [enemyLaserFade, setEnemyLaserFade] = useState(false);
  const [enemyBoomFade, setEnemyBoomFade] = useState(false);
  const [showEnemyBoom, setShowEnemyBoom] = useState(false);
  const [showEnemyMonster, setShowEnemyMonster] = useState(false);
  const [showEnemyLaser, setShowEnemyLaser] = useState(false);
  const [enemyshaking, setEnemyShaking] = useState(false);

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
    myScore,
  });

  // ✅ 2. 상태가 변경될 때마다 "라이브 포인터"의 내용물을 업데이트
  useEffect(() => {
    stateRef.current = {
      myLife,
      enemyLife,
      quizlist,
      currentindex,
      myScore,
    };
  }, [myLife, enemyLife, quizlist, currentindex, myScore]);

  // API URL
  const usersubmiturl = 'http://localhost:9000/oxquiz/submitOXquiz';
  const wronganswerurl = 'http://localhost:9000/oxquiz/wronganswer';
  const lobbyendedurl = 'http://localhost:9000/oxquiz/EndGame';
  const multiresulturl = 'http://localhost:9000/oxquiz/multiresult';

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
    if (!gameStarted || gameResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? +(prev - 0.1).toFixed(1) : 0.0));
    }, 100);
    return () => clearInterval(timer);
  }, [gameStarted, gameResult]);

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

    const socket = new SockJS('http://localhost:9000/ws-game');
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
              setAlertData({
                title: "이미 선택된 캐릭터입니다.",
                message: '다른 캐릭터를 선택해주세요.'
              });
              setAlertOpen(true);
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
                setTimeout(() => {
                  setShowMyBoom(false);
                  setIsShaking(false);
                  setShowMyLaser(false);
                  setShowMyMonster(false);
                  setMyMonsterFade(false);
                  setMyLaserFade(false);
                  setMyBoomFade(false);
                  setButtonDisabled(false);
                  setMyOX(null);
                }, 2000);
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
                  setEnemyShaking(true); // 화면 흔들림
                  setEnemyLife(prev => Math.max(0, prev - 1));
                }, 1200);
                setTimeout(() => {
                  setEnemyMonsterFade(true);
                  setEnemyLaserFade(true);
                  setEnemyBoomFade(true);
                }, 1700);
                setTimeout(() => {
                  setShowEnemyBoom(false);
                  setEnemyShaking(false);
                  setShowEnemyLaser(false);
                  setShowEnemyMonster(false);
                  setEnemyMonsterFade(false);
                  setEnemyLaserFade(false);
                  setEnemyBoomFade(false);
                }, 2000);
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
                setEnemyShaking(false);
              } else {
                // ==================================================
                //  게임 종료 조건 판별 및 결과 설정
                // ==================================================
                gameEndedRef.current = true;

                // 최종 라이프와 점수를 기준으로 승패 판정
                const finalMyLife = stateRef.current.myLife;
                const finalEnemyLife = stateRef.current.enemyLife;
                const finalScore = stateRef.current.myScore;

                if (finalMyLife <= 0 && finalEnemyLife > 0) {
                  setGameResult('LOSE');
                  axios.post(multiresulturl, {
                    user_id: useridx,
                    lobby_id: roomId,
                    score: finalScore,
                    user_rank: 2,
                    user_rank_point: -20,
                    game_type: "oxquiz",
                  }).then((res) => {
                    console.log("Multi result:", res.data);
                  });
                } else if (finalMyLife > 0 && finalEnemyLife <= 0) {
                  setGameResult('WIN');
                  axios.post(multiresulturl, {
                    user_id: useridx,
                    lobby_id: roomId,
                    score: finalScore,
                    user_rank: 1,
                    user_rank_point: 30,
                    game_type: "oxquiz",
                  }).then((res) => {
                    console.log("Multi result:", res.data);
                  });
                } else if (finalMyLife <= 0 && finalEnemyLife <= 0) {
                  // 둘 다 죽었을 경우 점수로 판정
                  setGameResult('DRAW');
                  axios.post(multiresulturl, {
                    user_id: useridx,
                    lobby_id: roomId,
                    score: finalScore,
                    user_rank: 0,
                    user_rank_point: 0,
                    game_type: "oxquiz",
                  }).then((res) => {
                    console.log("Multi result:", res.data);
                  });
                } else {
                  // 모든 문제를 풀었을 경우 (둘 다 살아있음)
                  if (finalMyLife > finalEnemyLife) {
                    setGameResult('WIN');
                    axios.post(multiresulturl, {
                      user_id: useridx,
                      lobby_id: roomId,
                      score: finalScore,
                      user_rank: 1,
                      user_rank_point: 30,
                      game_type: "oxquiz",
                    }).then((res) => {
                      console.log("Multi result:", res.data);
                    });
                  } else if (finalMyLife < finalEnemyLife) {
                    setGameResult('LOSE');
                    axios.post(multiresulturl, {
                      user_id: useridx,
                      lobby_id: roomId,
                      score: finalScore,
                      user_rank: 2,
                      user_rank_point: -20,
                      game_type: "oxquiz",
                    }).then((res) => {
                      console.log("Multi result:", res.data);
                    });
                  } else {
                    setGameResult('DRAW');
                    axios.post(multiresulturl, {
                      user_id: useridx,
                      lobby_id: roomId,
                      score: finalScore,
                      user_rank: 0,
                      user_rank_point: 0,
                      game_type: "oxquiz",
                    }).then((res) => {
                      console.log("Multi result:", res.data);
                    });
                  }
                }
                axios.post(lobbyendedurl, { host_user_id: data.hostId, roomid: roomId, status: "ENDED" }).then((res) => {
                  console.log("Lobby ended:", res.data);
                }).catch((err) => {
                  console.error("Error ending lobby:", err);
                });
              }
            }, 3000); // 3초 후 다음 문제
          }

          // 상대방 나감 등으로 게임 종료
          if (data.type === 'gameEnd') {
            if (String(data.winnerId) === String(useridx)) {
              gameEndedRef.current = true;

              const finalScore = stateRef.current.myScore;
              setGameResult('WIN');
              setAlertData({
                title: "게임 종료",
                message: "상대방이 게임을 나갔습니다. 승리 처리됩니다."
              });
              setAlertOpen(true);
              axios.post(multiresulturl, {
                user_id: useridx,
                lobby_id: roomId,
                score: finalScore,
                user_rank: 1,
                user_rank_point: 30,
                game_type: "oxquiz",
              }).then((res) => {
                console.log("Multi result:", res.data);
              });
              axios.post(lobbyendedurl, { host_user_id: useridx, roomid: roomId, status: "ENDED" }).then((res) => {
                console.log(res.data);
              }).catch((err) => {
                console.error("Error ending lobby:", err);
              });
            }
          }

        });



        // 방 스냅샷 요청
        client.publish({
          destination: '/app/ox/room.info',
          body: JSON.stringify({ type: 'info', roomId: +roomId })
        });
      }

      // 새로고침 후에도 join 메시지 전송
      client.publish({
        destination: '/app/ox/room.join',
        body: JSON.stringify({
          type: 'join',
          roomId: roomId,
          userId: useridx,
          nickname: usernickname,
        }),
      });
      // 에러 메시지 구독
      client.subscribe("/topic/ox/errors", msg => {
        const data = JSON.parse(msg.body);
        console.log("새로고침한 내 userId:", data.userId);
        // 내 userId와 일치하는 메시지만 처리
        if (data.type === 'joinDenied' && String(data.userId) === String(useridx)) {
          axios.post(multiresulturl, {
            user_id: useridx,
            lobby_id: roomId,
            score: 0,
            user_rank: 2,
            user_rank_point: -50,
            game_type: "oxquiz",
          }).then((res) => {
            console.log("Multi result:", res.data);
          });
          navigate('/oxquiz/OX_lobby', {state:{
            alertOpen: true,
            alertData: {
              title: "게임 종료",
              message: "도중에 게임에서 나가 패널티가 부과됩니다."
            }
          }});
        }
      });
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
  }, [navigate, roomId, useridx, usernickname]); // 의존성 배열은 그대로 유지

  // OX 클릭 → 내 답 전송
  const handleOXClick = (ox) => {
    if (buttonDisabled || gameResult) return;
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
    let isWin = false, isLose = false;
    if (gameResult === 'WIN') {
      resultText = 'WIN';
      isWin = true;
    } else if (gameResult === 'LOSE') {
      resultText = 'LOSE';
      isLose = true;
    } else {
      resultText = 'DRAW';
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          minWidth: '100vw',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          background: isWin
            ? 'linear-gradient(135deg, #ffe066 0%, #7fd8ff 100%)'
            : isLose
              ? 'linear-gradient(135deg, #232a3a 0%, #3a3a3a 100%)'
              : 'linear-gradient(135deg, #bdbdbd 0%, #e0e0e0 100%)',
          transition: 'background 0.5s',
          overflow: 'hidden',
        }}
      >
        {/* 축하/아쉬움 이펙트 */}
        {isWin && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: 1,
          }}>
            <div style={{
              position: 'absolute', left: '10%', top: '12%', fontSize: 48, opacity: 0.7,
              animation: 'fadeInUp 1.2s',
            }}>🏆</div>
            <div style={{
              position: 'absolute', left: '80%', top: '18%', fontSize: 38, opacity: 0.6,
              animation: 'fadeInUp 1.5s',
            }}>🎉</div>
            <div style={{
              position: 'absolute', left: '50%', top: '8%', fontSize: 60, opacity: 0.8, transform: 'translateX(-50%)',
              animation: 'fadeInUp 1.1s',
            }}>⭐</div>
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
        <div
          style={{
            background: isWin
              ? 'rgba(255,255,255,0.95)'
              : isLose
                ? 'rgba(34,52,79,0.97)'
                : 'rgba(220,220,220,0.97)',
            borderRadius: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
            padding: '54px 48px 44px 48px',
            minWidth: 400,
            maxWidth: 520,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
            position: 'relative',
          }}
        >
          {/* 타이틀 */}
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: isWin ? '#3a5ba0' : isLose ? '#ff7675' : '#888',
              textShadow: isWin
                ? '2px 2px 12px #ffe066'
                : isLose
                  ? '2px 2px 12px #22344f'
                  : '2px 2px 12px #bbb',
              marginBottom: 18,
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: 'center',
              animation: 'popIn 0.7s',
            }}
          >
            {isWin ? '🏆' : isLose ? '💀' : '🤝'} {resultText}
          </div>
          {/* 점수/닉네임/캐릭터 */}
          <div style={{
            display: 'flex',
            gap: 40,
            marginBottom: 18,
            justifyContent: 'center',
          }}>
            {/* 나 */}
            <div style={{
              background: isWin ? '#fffbe6' : isLose ? '#2b2b2b' : '#f0f0f0',
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
              padding: '18px 28px',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}>
              {/* 캐릭터 */}
              <div style={{
                marginBottom: 8,
                position: 'relative',
                width: 90,
                height: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={`/ox_image/char${selectedChar}.png`}
                  alt="내 캐릭터"
                  style={{
                    width: 90,
                    height: 90,
                    filter: isLose ? 'grayscale(0.7)' : 'drop-shadow(0 0 12px #ffe066)',
                    animation: isWin
                      ? 'jump 0.7s infinite cubic-bezier(0.5,0,0.5,1)'
                      : isLose
                        ? 'shake 0.3s infinite alternate'
                        : 'none',
                    zIndex: 2,
                    position: 'relative',
                  }}
                />
                {/* 패배시 연기 이모지 */}
                {isLose && (
                  <>
                    <span style={{
                      position: 'absolute',
                      left: 10,
                      top: 40,
                      fontSize: 35,
                      zIndex: 3,
                      pointerEvents: 'none',
                      animation: 'smokeUp 2s infinite linear',
                      opacity: 0.7,
                      filter: 'brightness(0.1) blur(1px)',
                    }}>💨</span>
                    <span style={{
                      position: 'absolute',
                      left: 50,
                      top: 30,
                      fontSize: 30,
                      zIndex: 3,
                      pointerEvents: 'none',
                      animation: 'smokeUp 2.5s infinite linear 0.8s',
                      opacity: 0.6,
                      filter: 'brightness(0.1) blur(1.5px)',
                    }}>💨</span>
                  </>
                )}
              </div>
              <div style={{
                fontWeight: 800,
                fontSize: 22,
                color: isWin ? '#3a5ba0' : isLose ? '#ffe066' : '#333',
                marginBottom: 4,
              }}>{usernickname}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: isWin ? '#ffb700' : isLose ? '#ff7675' : '#888',
              }}>{myScore}점</div>
            </div>
            {/* 상대 */}
            <div style={{
              background: isLose ? '#fffbe6' : isWin ? '#2b2b2b' : '#f0f0f0',
              borderRadius: 18,
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
              padding: '18px 28px',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}>
              {/* 캐릭터 */}
              <div style={{
                marginBottom: 8,
                position: 'relative',
                width: 90,
                height: 90,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={`/ox_image/char${enemySelectedChar}.png`}
                  alt="상대 캐릭터"
                  style={{
                    width: 90,
                    height: 90,
                    filter: isWin ? 'grayscale(0.7)' : 'drop-shadow(0 0 12px #ffe066)',
                    animation: isLose
                      ? 'jump 0.7s infinite cubic-bezier(0.5,0,0.5,1)'
                      : isWin
                        ? 'shake 0.3s infinite alternate'
                        : 'none',
                    zIndex: 2,
                    position: 'relative',
                  }}
                />
                {/* 내가 이겼을 때 상대는 연기 */}
                {isWin && (
                  <>
                    <span style={{
                      position: 'absolute',
                      left: 10,
                      top: 40,
                      fontSize: 35,
                      zIndex: 3,
                      pointerEvents: 'none',
                      animation: 'smokeUp 2s infinite linear',
                      opacity: 0.7,
                      filter: 'brightness(0.1) blur(1px)',
                    }}>💨</span>
                    <span style={{
                      position: 'absolute',
                      left: 50,
                      top: 30,
                      fontSize: 30,
                      zIndex: 3,
                      pointerEvents: 'none',
                      animation: 'smokeUp 2.5s infinite linear 0.8s',
                      opacity: 0.6,
                      filter: 'brightness(0.1) blur(1.5px)',
                    }}>💨</span>
                  </>
                )}
              </div>
              <div style={{
                fontWeight: 800,
                fontSize: 22,
                color: isLose ? '#3a5ba0' : isWin ? '#ffe066' : '#333',
                marginBottom: 4,
              }}>{enemynickname}</div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: isLose ? '#ffb700' : isWin ? '#ff7675' : '#888',
              }}>{enemyScore}점</div>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'OX_lobby'}
            style={{
              marginTop: 10,
              padding: '14px 38px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 800,
              fontSize: 22,
              background: isWin
                ? 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)'
                : isLose
                  ? 'linear-gradient(90deg, #888 0%, #232a3a 100%)'
                  : 'linear-gradient(90deg, #bdbdbd 0%, #e0e0e0 100%)',
              color: isWin ? '#22344f' : isLose ? '#fff' : '#333',
              boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s',
              letterSpacing: 1,
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = isWin
                ? 'linear-gradient(90deg, #7fd8ff 0%, #ffe066 100%)'
                : isLose
                  ? 'linear-gradient(90deg, #232a3a 0%, #888 100%)'
                  : 'linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 100%)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = isWin
                ? 'linear-gradient(90deg, #ffe066 0%, #7fd8ff 100%)'
                : isLose
                  ? 'linear-gradient(90deg, #888 0%, #232a3a 100%)'
                  : 'linear-gradient(90deg, #bdbdbd 0%, #e0e0e0 100%)';
            }}
          >
            로비로 돌아가기
          </button>
          <style>{`
            @keyframes jump {
              0% { transform: translateY(0);}
              30% { transform: translateY(-30px);}
              50% { transform: translateY(-20px);}
              70% { transform: translateY(-30px);}
              100% { transform: translateY(0);}
            }
            @keyframes shake {
              0% { transform: translateX(0);}
              25% { transform: translateX(-5px);}
              50% { transform: translateX(5px);}
              75% { transform: translateX(-5px);}
              100% { transform: translateX(0);}
            }
            @keyframes smokeUp {
              0% { opacity: 0.7; transform: translateY(0);}
              100% { opacity: 0; transform: translateY(-40px);}
            }
            @keyframes popIn {
              0% { opacity: 0; transform: scale(0.7);}
              100% { opacity: 1; transform: scale(1);}
            }
          `}</style>
          {/* 알림 다이얼로그 */}
          <AlertDialog
            open={alertOpen}
            title={alertData.title}
            message={alertData.message}
            onConfirm={() => setAlertOpen(false)}
          />
        </div>
      </div>
    );
  }

  // ================
  // 게임 화면
  // ================
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="ox-stage">
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
            <div className="ox-scoreboard">{myScore}</div>
            <div className="ox-lifewrap">{renderHearts(myLife)}</div>
          </div>

          {/* 상대방 */}
          <div className={`ox-char${enemyshaking ? ' ox-shake' : ''}`}>
            {showEnemyMonster && (
              <img
                src="/ox_image/monster.png"
                alt="enemy-monster"
                className="ox-monster"
                style={enemyMonsterFade ? { animation: 'monsterDrop 0.5s cubic-bezier(0.7,0,0.5,1) forwards, fadeout 0.3s linear' } : {}}
                draggable={false}
              />
            )}
            {showEnemyLaser && (
              <img
                src="/ox_image/laserYellow1.png"
                alt="enemy-laser"
                className="ox-laser"
                style={enemyLaserFade ? { animation: 'laserDrop 0.5s cubic-bezier(0.7,0,0.5,1), fadeout 0.3s linear', transformOrigin: 'top' } : { transformOrigin: 'top' }}
                draggable={false}
              />
            )}
            {showEnemyBoom && (
              <img
                src="/ox_image/laserboom2.png"
                alt="enemyBoom"
                className="ox-boom"
                // ✅ 3. 상대 폭발 fade out 애니메이션 적용
                style={enemyBoomFade ? { animation: 'boomShow 0.4s, fadeout 0.3s linear' } : {}}
                draggable={false}
              />
            )}
            {/* ✅ 상대방 캐릭터 이미지와 효과를 감싸는 div 추가 */}
            <div style={{ position: 'relative', display: 'inline-block', width: 90, height: 90 }}>
              <img
                src={`/ox_image/char${enemySelectedChar}.png`}
                alt="플레이어2"
                style={{
                  width: 90,
                  height: 90,
                  zIndex: 1,
                  position: 'relative',
                  animation: enemyLife === 1 ? 'criticalShake 0.3s infinite alternate' : 'none'
                }}
              />
              {/* ✅ 상대방 생명력(enemyLife)에 따른 효과 추가 */}
              {enemyLife <= 2 && (
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
              {enemyLife === 1 && (
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