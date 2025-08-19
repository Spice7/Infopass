import React, { useContext, useEffect, useState } from 'react';
import './CardGame.css';
import * as auth from './CardAuth';
import CardLoading from './loading/CardLoading';
import { LoginContext } from '../../user/LoginContextProvider';

const CardMain = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty] = useState('normal'); // normal
  const [gameMode, setGameMode] = useState('normal'); // normal, timeAttack
  const [timeLimit, setTimeLimit] = useState(300); // 5분 (초 단위)
  const [remainingTime, setRemainingTime] = useState(300);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 페이지 진입 시 로딩 표시
  const [questionData, setQuestionData] = useState([]);
  const { userInfo } = useContext(LoginContext);
  const [randomSubject, setRandomSubject] = useState('소프트웨어 설계'); // 기본 과목
  const [showNextButton, setShowNextButton] = useState(false);
  const [question_id, setQuestionId] = useState(null); // 맞힌 문제 ID

  // 과목 리스트 예시
  const subjectList = [
    '소프트웨어 설계',
    '소프트웨어 개발',
    '데이터베이스 구축',
    '프로그래밍 언어 활용',
    '정보시스템 구축 관리'
  ];

  // 랜덤 과목 선택 함수
  const getRandomSubject = () => {
    return subjectList[Math.floor(Math.random() * subjectList.length)];
  };
  
  // 문제 불러오기 + 카드 배열 생성 통합
  const startNewGame = async (difficulty, mode = gameMode) => {    
    
    setIsLoading(true);
    setShowNextButton(false);
    try {
      // 랜덤 과목 선택 함수
      const subject = getRandomSubject();
      setRandomSubject(subject); // 상태 업데이트
      console.log(subject);

      const response = await auth.getCardQuestions(subject, userInfo?.id);
      console.log("문제리스트: ", response.data);
      let questions = [];
      if (response && response.data) {
        questions = response.data;
      } else {
        setIsLoading(false);
        return;
      }

      // 8문제 고정
    const selectedQuestions = questions;

      // 타임어택 모드일 때 시간 제한 설정
      let gameTimeLimit = timeLimit;
      if (mode === 'timeAttack') {
        if (difficulty === 'normal') {
          gameTimeLimit = 180; // 3분        
        setTimeLimit(gameTimeLimit);
        setRemainingTime(gameTimeLimit);
        }
      }

      // 질문과 답변을 각각 카드로 생성
      const gameCards = [];
      selectedQuestions.forEach((item) => {
        // 질문 카드
        gameCards.push({
          id: `q${item.id}`,
          type: 'question',
          content: item.question,
          pairId: item.id,
          isFlipped: false,
          isMatched: false
        });

        // 답변 카드
        gameCards.push({
          id: `a${item.id}`,
          type: 'answer',
          content: item.answer,
          pairId: item.id,
          isFlipped: false,
          isMatched: false
        });
      });

      // 카드 섞기
      const shuffledCards = shuffleArray(gameCards);
      // 상태 초기화
      setQuestionData(questions);
      setCards(shuffledCards);
      setFlippedCards([]);
      setMatchedPairs([]);
      setScore(0);
      setMoves(0);
      setTimer(0);
      setGameStarted(true);
      setIsPlaying(true);
      setHints(3);
      setShowHint(false);
    } catch (error) {
      console.error('문제 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 배열 섞기 함수
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };


  // 카드 클릭 처리
  const handleCardClick = (cardId) => {
    if (!isPlaying || flippedCards.length === 2) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    // 카드 뒤집기
    const updatedCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    // 뒤집힌 카드에 추가
    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);

    // 2장이 뒤집혔을 때 매칭 확인
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      if (newFlippedCards[0].pairId === newFlippedCards[1].pairId) {
        // 매칭 성공
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.pairId === newFlippedCards[0].pairId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs(prev => [...prev, newFlippedCards[0].pairId]);
          setScore(prev => prev + 100);
          setFlippedCards([]);         
        }, 500);
      } else {
        // 매칭 실패
        setTimeout(() => {

          setCards(prevCards =>
            prevCards.map(c =>
              newFlippedCards.some(fc => fc.id === c.id)
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // 게임 종료(성공/타임아웃) 통합 함수
  const handleGameEnd = async ({ isTimeout = false } = {}) => {
    setIsPlaying(false);

    let finalScore = score;
    let completed = true;

    // 타임어택 모드 시간 보너스
    if (gameMode === 'timeAttack') {
      const timeBonus = Math.max(0, Math.floor(remainingTime / 10));
      finalScore += timeBonus;
    } else {
      finalScore += Math.max(0, 180 - timer * 10);
    }

    // 타임아웃일 때 오답노트 저장
    if (isTimeout) {
      completed = false;
      // 매칭되지 않은 카드의 pairId 추출
      const wrongPairIds = cards
        .filter(card => !card.isMatched)
        .map(card => card.pairId);

      // 오답 문제 추출
      const wrongQuestions = questionData.filter(q => wrongPairIds.includes(q.id));

      // 서버로 오답노트 저장
      if (wrongQuestions.length > 0) {
        try {
          await auth.saveWrongNotes(wrongQuestions);
        } catch (e) {
          console.error('오답노트 저장 실패:', e);
        }
      }
    }

    // 서버로 게임 결과 저장
    try {
      await auth.saveGameResult({
        userId: userInfo?.id,
        score: finalScore,
        moves,
        time: timer,
        gameMode,
        completed
      });
    } catch (e) {
      console.error('게임 결과 저장 실패:', e);
    }

    setScore(finalScore);
  };

  // 모든 카드 매칭 완료 시 게임 종료
  useEffect(() => {
    if (
      gameStarted &&
      isPlaying &&
      cards.length > 0 &&
      cards.every(c => c.isMatched)
    ) {
      handleGameEnd({ isTimeout: false });
      setShowNextButton(true); // 게임 완료 시 다음 문제로 넘어가기 버튼 표시
    }
    // eslint-disable-next-line
  }, [cards, gameStarted, isPlaying]);

  // "다음 문제" 버튼 클릭 시 새로운 랜덤 과목의 문제로 새 게임 시작
  const handleNextQuestions = () => {
    setGameStarted(false);
    setTimeout(() => {
      startNewGame();
    }, 300); // 약간의 딜레이로 UX 개선
  };

  // 타이머 효과 및 타임어택 시간 초과 처리
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);

        // 타임어택 모드일 때 남은 시간 감소
        if (gameMode === 'timeAttack') {
          setRemainingTime(prev => {
            if (prev <= 1) {
              // 시간 초과
              handleGameEnd({ isTimeout: true });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isPlaying, gameStarted, gameMode]);

  // 힌트 사용
  const useHint = () => {
    if (hints > 0 && !showHint) {
      setHints(prev => prev - 1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000); // 3초간 힌트 표시
    }
  };

  // 게임 모드 변경
  const changeGameMode = (mode) => {
    setGameMode(mode);
    if (mode === 'timeAttack') {
      // 타임어택 모드일 때 난이도별 시간 제한 설정
      if (difficulty === 'normal') {
        setTimeLimit(180);
        setRemainingTime(180);
      }
    }
  };


  // "게임 재시작" 버튼 클릭 시
  const handleRestart = () => {
    setGameStarted(false); // 난이도 선택 화면으로 이동
    setIsPlaying(false);
    setScore(0);
    setMoves(0);
    setTimer(0);
    setMatchedPairs([]);
    setFlippedCards([]);
    setCards([]);
    setHints(3);
    setShowHint(false);
    setGameMode('normal');
    setTimeLimit(180);
    setRemainingTime(180);
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <CardLoading />;
  }

  return (
    <div className="card-game-container">
      <div className="game-header">
        <h1>정보처리기사 카드게임</h1>
        <p>질문과 답변을 매칭하여 모든 카드를 찾아보세요!</p>
        <p style={{fontWeight:'bold'}}>이번 문제 과목: {randomSubject}</p>
      </div>

      {!gameStarted ? (
        <div className="game-start">
          <div className="game-mode-selector">
            <h3>게임 모드를 선택하세요</h3>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${gameMode === 'normal' ? 'active' : ''}`}
                onClick={() => changeGameMode('normal')}
              >
                🎯 일반 모드
              </button>
              <button
                className={`mode-btn ${gameMode === 'timeAttack' ? 'active' : ''}`}
                onClick={() => changeGameMode('timeAttack')}
              >
                ⏰ 타임어택 모드
              </button>
            </div>
            {gameMode === 'timeAttack' && (
              <div className="time-limit-info">
                <p>⏱️ 제한 시간:</p>
                <p>🟢  3분 </p>
              </div>
            )}
          </div>
          <button className="start-button" onClick={() => startNewGame(difficulty, gameMode)}>
            게임 시작
          </button>
        </div>
      ) : (
        <>
          <div className="game-info">
            <div className="info-item">
              <span className="label">점수:</span>
              <span className="value">{score}</span>
            </div>
            <div className="info-item">
              <span className="label">이동:</span>
              <span className="value">{moves}</span>
            </div>
            {gameMode === 'timeAttack' ? (
              <div className="info-item time-attack">
                <span className="label">남은 시간:</span>
                <span className={`value ${remainingTime <= 30 ? 'warning' : ''}`}>
                  {formatTime(remainingTime)}
                </span>
              </div>
            ) : (
              <div className="info-item">
                <span className="label">경과 시간:</span>
                <span className="value">{formatTime(timer)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">진행률:</span>
              <span className="value">{Math.round((matchedPairs.length / (difficulty === 'easy' ? 8 : difficulty === 'hard' ? 20 : 12)) * 100)}%</span>
            </div>
            <div className="info-item">
              <span className="label">힌트:</span>
              <button
                className={`hint-button ${hints > 0 ? 'available' : 'disabled'}`}
                onClick={useHint}
                disabled={hints === 0}
              >
                💡 힌트 ({hints})
              </button>
            </div>
          </div>

          <div className="cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${showHint && !card.isFlipped ? 'hint-active' : ''}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-content">
                      <span className="card-icon">?</span>
                      <span className="card-text">카드를 클릭하세요</span>
                      {showHint && !card.isFlipped && (
                        <div className="hint-indicator">
                          {card.type === 'question' ? '📝 질문' : '💡 답변'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-back">
                    <div className="card-content">
                      <span className="card-type">{card.type === 'question' ? 'Q' : 'A'}</span>
                      <div className="card-text-content">
                        {card.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="game-controls">
            <button className="restart-button" onClick={handleRestart}>
              게임 재시작
            </button>
          </div>
          {showNextButton && (
            <div className="next-question-btn-wrap" style={{ textAlign: 'center', margin: '20px 0' }}>
              <button className="next-question-btn" onClick={handleNextQuestions}>
                다음 문제로 ▶
              </button>
            </div>
          )}
          
          {!isPlaying && matchedPairs.length === questionData.length && (
            <div className="game-complete">
              <h2>🎉 게임 완료! 🎉</h2>
              <p>축하합니다! 모든 카드를 매칭했습니다!</p>
              <div className="final-stats">
                <p>최종 점수: {score}점</p>
                <p>총 이동: {moves}회</p>
                {gameMode === 'timeAttack' ? (
                  <p>남은 시간: {formatTime(remainingTime)}</p>
                ) : (
                  <p>소요 시간: {formatTime(timer)}</p>
                )}
                <p>게임 모드: {gameMode === 'timeAttack' ? '타임어택' : '일반'}</p>
              </div>
            </div>
          )}

          {!isPlaying && gameMode === 'timeAttack' && remainingTime === 0 && (
            <div className="game-timeout">
              <h2>⏰ 시간 초과! ⏰</h2>
              <p>제한 시간 내에 게임을 완료하지 못했습니다.</p>
              <div className="final-stats">
                <p>최종 점수: {score}점</p>
                <p>총 이동: {moves}회</p>
                <p>완료된 매칭: {matchedPairs.length}개</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardMain;
