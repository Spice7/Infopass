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
  const [enemyOX, setEnemyOX] = useState(null);
  const [enemyScore, setEnemyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [myLife, setMyLife] = useState(MAX_LIFE);
  const [enemyLife, setEnemyLife] = useState(MAX_LIFE);
  const [resultMsg, setResultMsg] = useState("");
  const [currentindex, setcurrentindex] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [quizlist, setquizlist] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [correctOX, setCorrectOX] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const { userInfo } = useContext(LoginContext);
  // 서버 reveal 지연시 폴백 타임아웃 저장
  const revealTimeoutRef = useRef(null);

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

  // 애니메이션 상태(내 피격)
  const [showMonster, setShowMonster] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showBoom, setShowBoom] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterFade, setMonsterFade] = useState(false);
  const [laserFade, setLaserFade] = useState(false);
  const [boomFade, setBoomFade] = useState(false);

  // 상대 피격 연출
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

  // API URL
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

  // 문제 이동 시 라운드 상태 초기화
  useEffect(() => {
    setShowResult(false);
    setCorrectOX(null);
    setButtonDisabled(false);
    setTimeLeft(TIMER_DURATION);
    setShowEnemyBoom(false);
    setShowEnemyMonster(false);
    setShowEnemyLaser(false);
    setResultMsg(''); // 문제란 메시지 초기화
    revealSentRef.current = false;
    try { if (revealTimeoutRef.current) { clearTimeout(revealTimeoutRef.current); revealTimeoutRef.current = null; } } catch { /* noop */ }
  }, [currentindex]);

  // 정답 공개 후 즉시 다음 문제로 이동: reveal 핸들러에서 처리

  // 웹소켓 연결
  useEffect(() => {
    const socket = new SockJS('http://localhost:9000/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      reconnectDelay: 5000
    });

    let roomSub; // 방 토픽 구독 핸들

    client.onConnect = () => {
      // 방 정보 구독 -> 상대 닉네임/ID 세팅 및 게임 이벤트 수신
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

            setquizlist(Array.isArray(data.quizList) ? data.quizList : []);
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
    return () => {
  try { roomSub?.unsubscribe(); } catch { /* noop */ }
      client.deactivate();
    };
  // roomId 또는 사용자 변경 때만 재연결
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, useridx]);

  // 승패 판정
  useEffect(() => {
    if (gameEndedRef.current) return;
    const allSolved = currentindex === quizlist.length - 1 && showResult;
    const myLose = myLife === 0;
    const enemyLose = enemyLife === 0;

    if (allSolved || myLose || enemyLose) {
      let result = '';
      if (myLose && enemyLose) result = '무승부!';
      else if (myLose) result = '패배!';
      else if (enemyLose) result = '승리!';
      else {
        if (myScore > enemyScore) result = '승리!';
        else if (myScore < enemyScore) result = '패배!';
        else result = '무승부!';
      }
      alert(result);
      setGameStarted(false);
      gameEndedRef.current = true;
      // TODO: 결과 DB 저장
    }
  }, [showResult, currentindex, myLife, enemyLife, myScore, enemyScore, quizlist.length]);

  // OX 클릭 → 내 답 전송
  const handleOXClick = (ox) => {
    if (buttonDisabled || showResult) return;
    setMyOX(ox);

    if (stompClient && stompClient.connected && roomId) {
      stompClient.publish({
        destination: '/app/ox/room.answer',
        body: JSON.stringify({
          type: 'answer',
          roomId: +roomId,
          userId: useridx,
          qIndex: currentindex,
          answer: ox // 'O' or 'X'
        })
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
                    <div style={{ position: 'absolute', width: '100%', textAlign: 'center', top: 90, color: 'black', fontSize: '25px'  }}>
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
          setResultMsg('');
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
            showQuiz ? `${currentindex + 1} ${quizlist[currentindex]?.question}` : ''
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
            {myOX && (
              <div className="ox-oxabove">
                <img
                  src={myOX === 'O' ? '/ox_image/O.png' : '/ox_image/X.png'}
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
                  src={enemyOX === 'O' ? '/ox_image/O.png' : '/ox_image/X.png'}
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