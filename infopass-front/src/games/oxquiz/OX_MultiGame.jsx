import React, { useState, useEffect, useRef } from 'react';
import './OX_Quiz.css';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const MAX_LIFE = 3;
const TIMER_DURATION = 1800; //
const walkImgs = Array.from({ length: 16 }, (_, i) => `/ox_image/walk${i + 1}.png`);

const OX_MultiGame = () => {
  // 상태 변수
  const [myOX, setMyOX] = useState(null); // 나 
  const [myScore, setMyScore] = useState(0);
  const [enemyOX, setEnemyOX] = useState(null); // 상대방
  const [enemyScore, setEnemyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [quizlist, setquizlist] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [correctOX, setCorrectOX] = useState(null); // 정답 OX
  const [showResult, setShowResult] = useState(false); // 정답 공개 여부

  // 사용자 정보
  const [userid, setuserid] = useState('hong@naver.com');
  const [useridx, setuseridx] = useState(0);
  const [usernickname, setusernickname] = useState('');
  // 상대방 정보
  const [enemyid, setEnemyid] = useState('asd1234@naver.com');
  const [enemyidx, setEnemyidx] = useState(0);
  const [enemynickname, setEnemynickname] = useState('');

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

  // 로딩 애니메이션
  useEffect(() => {
    if (!loading) return;
    const walkTimer = setInterval(() => {
      setWalkFrame(prev => (prev + 1) % walkImgs.length);
    }, 180);
    return () => clearInterval(walkTimer);
  }, [loading]);

  // 1.5초 후 게임 시작
  useEffect(() => {
    if (!loading) return;
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
    return () => clearTimeout(timer);
  }, [loading]);

  // 퀴즈 데이터 가져오기
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

  // 사용자 정보 가져오기
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
  // 상대방 정보 가져오기
  useEffect(() => {
    axios.post(finduserurl, { email: enemyid })
      .then((res) => {
        setEnemynickname(res.data.nickname);
        setEnemyidx(res.data.id);
      })
      .catch((error) => {
        console.error("상대방 정보 에러:", error);
      });
  }, [enemyid]);

  // 타이머 작동 및 정답 공개/판정
  useEffect(() => {
    if (!showQuiz) return;
    if (timeLeft <= 0) {
      setButtonDisabled(true);
      // 정답 공개 처리
      if (!showResult) {
        const answerOX = quizlist[currentindex]?.answer === 1 ? 'O' : 'X';

        setCorrectOX(answerOX);
        setShowResult(true);

        // 내 판정
        let myCorrect = myOX === answerOX;
        if (myOX !== 'O' && myOX !== 'X') {
          myCorrect = false;
        }
        axios.post(usersubmiturl, {
          user_id: useridx,
          quiz_id: quizlist[currentindex]?.id,
          submitted_answer: myOX,
          is_correct: myCorrect
        });

        if (!myCorrect) {
          setShowMonster(true);
          setTimeout(() => setShowLaser(true), 800);
          setTimeout(() => {
            setShowBoom(true);
            setIsShaking(true);
            setMyLife(prev => (prev > 0 ? prev - 1 : 0));
          }, 1200);
          setTimeout(() => {
            setShowBoom(false);
            setIsShaking(false);
            setShowLaser(false);
            setShowMonster(false);
            setMonsterFade(false);
            setLaserFade(false);
            setBoomFade(false);
          }, 2000);

          // 오답 기록 저장 (여기에 추가)
          axios.post(wronganswerurl, {
            user_id: useridx,
            game_type: "oxquiz",
            question_id: quizlist[currentindex]?.id,
            submitted_answer: myOX
          }).then(() => {
            console.log("오답 기록 저장 성공");
          });
        } else {
          setMyScore(prev => prev + 1);
        }

        // 상대방 판정
        let enemyCorrect = enemyOX === answerOX;
        if (!enemyOX) enemyCorrect = false;
        if (!enemyCorrect) {
          setEnemyLife(prev => (prev > 0 ? prev - 1 : 0));
          // 상대방 머리위 몬스터/레이저 애니메이션 추가 가능
        } else {
          setEnemyScore(prev => prev + 1);
        }
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? +(prev - 0.1).toFixed(1) : 0.0);
    }, 100);
    return () => clearInterval(timer);
  }, [showQuiz, timeLeft, quizlist, currentindex, myOX, enemyOX, showResult]);

  // 문제 넘어갈 때 정답 공개/내 결과 메시지 초기화
  useEffect(() => {
    setShowResult(false);
    setCorrectOX(null);
    setMyOX(null);
    setEnemyOX(null);
    setButtonDisabled(false);
    setTimeLeft(TIMER_DURATION);
  }, [currentindex]);

  // 정답 공개 후 2초 뒤에 다음 문제로 이동
  useEffect(() => {
    if (showResult) {
      if (currentindex < quizlist.length - 1) {
        const timer = setTimeout(() => {
          setcurrentindex(prev => prev + 1);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [showResult, currentindex, quizlist.length]);
  // 웹소켓 연결
  useEffect(() => {
    const socket = new SockJS('http://localhost:9000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/oxquiz', (message) => {
        const data = JSON.parse(message.body);
        if (data.type === 'ox') {
          setEnemyOX(data.ox);
        }
        if (data.type === 'score') {
          setEnemyScore(data.score);
        }
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  // 하트 렌더링
  const renderHearts = (life) =>
    Array.from({ length: MAX_LIFE }).map((_, idx) => (
      <span key={idx} className="ox-heart">
        {idx < life ? '❤️' : '💔'}
      </span>
    ));

  // 게임 종료 처리 및 승패/무승부 판정
  useEffect(() => {
    if (gameEndedRef.current) return;
    const allSolved = currentindex === quizlist.length - 1 && showResult;
    const myLose = myLife === 0;
    const enemyLose = enemyLife === 0;

    if (allSolved || myLose || enemyLose) {
      let result = "";
      if (myLose && enemyLose) result = "무승부!";
      else if (myLose) result = "패배!";
      else if (enemyLose) result = "승리!";
      else {
        if (myScore > enemyScore) result = "승리!";
        else if (myScore < enemyScore) result = "패배!";
        else result = "무승부!";
      }
      alert(result);
      setGameStarted(false);
      gameEndedRef.current = true;
      // DB 저장 등 추가
    }
  }, [showResult, currentindex, myLife, enemyLife, myScore, enemyScore, quizlist.length]);

  // OX 버튼 클릭 처리
  const handleOXClick = (ox) => {
    if (buttonDisabled || showResult) return;
    setMyOX(ox);

    // 웹소켓으로 내 선택값 전송
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/oxquiz',
        body: JSON.stringify({
          type: 'ox',
          user: usernickname,
          ox: ox,
        }),
      });
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

  // 게임 종료 화면
  if (!gameStarted) {
    return (
      <div className="ox-gameover">
        <h2>{myLife <= 0 ? 'GAME OVER' : 'CLEAR!'}</h2>
        <p>최종 점수: {myScore}</p>
        <button onClick={() => {
          setMyScore(0);
          setMyLife(MAX_LIFE);
          setEnemyScore(0);
          setEnemyLife(MAX_LIFE);
          setcurrentindex(0);
          setTimeLeft(TIMER_DURATION);
          setShowQuiz(false);
          setCountdown(null);
          setButtonDisabled(false);
          setResultMsg("");
          setMyOX(null);
          setShowMonster(false);
          setShowLaser(false);
          setShowBoom(false);
          setIsShaking(false);
          setMonsterFade(false);
          setLaserFade(false);
          setBoomFade(false);
          gameEndedRef.current = false;
          setGameStarted(true);
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
      <div className="ox-container">
        {/* 문제 영역 */}
        <div className="ox-quiz">
          {showResult ? (
            <>
              <div>정답은 <b>{correctOX} 입니다!!!</b></div>
            </>
          ) : (
            resultMsg ? <span className='resultMsg'>{resultMsg}</span> : (showQuiz ? currentindex + 1 + " " + quizlist[currentindex]?.question : "")
          )}
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
              disabled={buttonDisabled || showResult}
            />
            <img
              src="/ox_image/X.png"
              alt="X"
              className={`ox-oximg${myOX === 'X' ? ' ox-oximg-active' : ''}`}
              onClick={() => handleOXClick('X')}
              draggable={false}
              disabled={buttonDisabled || showResult}
            />
          </div>
        )}
        {/* 캐릭터 및 이펙트 */}
        <div className="ox-charwrap">
          {/* 내 캐릭터 */}
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
                src={`/ox_image/char1.png`}
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
            <div className="ox-scoreboard">{myScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(myLife)}
            </div>
          </div>
          {/* 상대방 캐릭터 */}
          <div className="ox-char">
            <img src="/ox_image/char3.png" alt="플레이어2" style={{ width: '90px', height: '90px' }} />
            <div className="ox-nick">{enemynickname}</div>
            <div className="ox-scoreboard">{enemyScore}</div>
            <div className="ox-lifewrap">
              {renderHearts(enemyLife)}
            </div>
            {enemyOX && (
              <div className="ox-oxabove">
                <img
                  src={enemyOX === 'O' ? '/ox_image/O.png' : '/ox_image/X.png'}
                  alt={enemyOX}
                  style={{ width: '60px', height: '70px' }}
                  draggable={false}
                />
              </div>
            )}
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

export default OX_MultiGame;