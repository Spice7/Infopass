import React, { useState, useEffect } from 'react';
import './CardGame.css';

const CardMain = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);

  // 정보처리기사 문제 데이터
  const questionData = [
    {
      id: 1,
      question: "데이터베이스에서 트랜잭션의 ACID 속성 중 'A'는 무엇을 의미하는가?",
      answer: "원자성(Atomicity)"
    },
    {
      id: 2,
      question: "OSI 7계층 중 전송 계층은 몇 번째 계층인가?",
      answer: "4계층"
    },
    {
      id: 3,
      question: "프로세스와 스레드의 차이점 중 하나는?",
      answer: "프로세스는 독립적인 메모리 공간, 스레드는 공유 메모리 공간"
    },
    {
      id: 4,
      question: "SQL에서 GROUP BY 절의 역할은?",
      answer: "특정 컬럼을 기준으로 행을 그룹화"
    },
    {
      id: 5,
      question: "네트워크에서 IP 주소의 클래스 A는 몇 비트로 네트워크를 구분하는가?",
      answer: "8비트"
    },
    {
      id: 6,
      question: "객체지향 프로그래밍의 4가지 특징은?",
      answer: "캡슐화, 상속, 다형성, 추상화"
    },
    {
      id: 7,
      question: "데이터베이스 정규화의 목적은?",
      answer: "데이터 중복 제거 및 무결성 향상"
    },
    {
      id: 8,
      question: "HTTP 상태 코드 404는 무엇을 의미하는가?",
      answer: "Not Found (요청한 리소스를 찾을 수 없음)"
    },
    {
      id: 9,
      question: "스택(Stack) 자료구조의 특징은?",
      answer: "LIFO (Last In First Out)"
    },
    {
      id: 10,
      question: "네트워크에서 라우터의 주요 기능은?",
      answer: "패킷의 경로 결정 및 전달"
    },
    {
      id: 11,
      question: "데이터베이스 인덱스의 장점은?",
      answer: "검색 속도 향상"
    },
    {
      id: 12,
      question: "프로세스 스케줄링 알고리즘 중 FCFS는?",
      answer: "First Come First Served (선착순)"
    },
    {
      id: 13,
      question: "TCP와 UDP의 차이점 중 하나는?",
      answer: "TCP는 연결지향적, UDP는 비연결지향적"
    },
    {
      id: 14,
      question: "데이터베이스에서 뷰(View)의 장점은?",
      answer: "보안성 향상 및 데이터 접근 제어"
    },
    {
      id: 15,
      question: "네트워크에서 서브넷 마스크의 역할은?",
      answer: "IP 주소의 네트워크 부분과 호스트 부분을 구분"
    },
    {
      id: 16,
      question: "운영체제에서 데드락(Deadlock)의 필요조건은?",
      answer: "상호배제, 점유대기, 비선점, 순환대기"
    },
    {
      id: 17,
      question: "데이터베이스에서 외래키(Foreign Key)의 역할은?",
      answer: "테이블 간의 참조 무결성 보장"
    },
    {
      id: 18,
      question: "네트워크에서 DNS의 주요 기능은?",
      answer: "도메인 이름을 IP 주소로 변환"
    },
    {
      id: 19,
      question: "객체지향에서 다형성(Polymorphism)의 의미는?",
      answer: "하나의 인터페이스로 여러 구현을 제공"
    },
    {
      id: 20,
      question: "데이터베이스에서 트리거(Trigger)의 역할은?",
      answer: "특정 이벤트 발생 시 자동으로 실행되는 프로시저"
    }
  ];

  // 게임 초기화
  const initializeGame = () => {
    const gameCards = [];
    
    // 난이도에 따른 문제 수 조절
    let selectedQuestions = questionData;
    if (difficulty === 'easy') {
      selectedQuestions = questionData.slice(0, 8); // 8문제
    } else if (difficulty === 'hard') {
      selectedQuestions = questionData; // 20문제
    } else {
      selectedQuestions = questionData.slice(0, 12); // 12문제 (기본)
    }
    
    // 질문과 답변을 각각 카드로 생성
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

    // 카드 순서 섞기
    const shuffledCards = shuffleArray(gameCards);
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
    if (!isPlaying) return;

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
          const matchedCards = updatedCards.map(c => 
            c.pairId === newFlippedCards[0].pairId 
              ? { ...c, isMatched: true } 
              : c
          );
          setCards(matchedCards);
          setMatchedPairs(prev => [...prev, newFlippedCards[0].pairId]);
          setScore(prev => prev + 100);
          setFlippedCards([]);
          
          // 게임 완료 확인
          if (matchedCards.filter(c => c.isMatched).length === matchedCards.length) {
            handleGameComplete();
          }
        }, 500);
      } else {
        // 매칭 실패
        setTimeout(() => {
          const resetCards = updatedCards.map(c => 
            newFlippedCards.some(fc => fc.id === c.id) 
              ? { ...c, isFlipped: false } 
              : c
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // 힌트 사용
  const useHint = () => {
    if (hints > 0 && !showHint) {
      setHints(prev => prev - 1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000); // 3초간 힌트 표시
    }
  };

  // 난이도 변경
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  // 게임 완료 처리
  const handleGameComplete = () => {
    setIsPlaying(false);
    const finalScore = score + Math.max(0, 1200 - timer * 10); // 시간 보너스
    setScore(finalScore);
    
    // 결과 저장 (로컬 스토리지)
    const gameResult = {
      date: new Date().toLocaleDateString(),
      score: finalScore,
      moves: moves,
      time: timer,
      completed: true
    };
    
    const savedResults = JSON.parse(localStorage.getItem('cardGameResults') || '[]');
    savedResults.push(gameResult);
    localStorage.setItem('cardGameResults', JSON.stringify(savedResults));
  };

  // 게임 재시작
  const restartGame = () => {
    setGameStarted(false);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setTimer(0);
    setIsPlaying(false);
  };

  // 타이머 효과
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted]);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-game-container">
      <div className="game-header">
        <h1>정보처리기사 카드게임</h1>
        <p>질문과 답변을 매칭하여 모든 카드를 찾아보세요!</p>
      </div>

      {!gameStarted ? (
        <div className="game-start">
          <div className="difficulty-selector">
            <h3>난이도를 선택하세요</h3>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => changeDifficulty('easy')}
              >
                🟢 쉬움 (8문제)
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'normal' ? 'active' : ''}`}
                onClick={() => changeDifficulty('normal')}
              >
                🟡 보통 (12문제)
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => changeDifficulty('hard')}
              >
                🔴 어려움 (20문제)
              </button>
            </div>
          </div>
          <button className="start-button" onClick={initializeGame}>
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
            <div className="info-item">
              <span className="label">시간:</span>
              <span className="value">{formatTime(timer)}</span>
            </div>
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
            <button className="restart-button" onClick={restartGame}>
              게임 재시작
            </button>
          </div>

          {!isPlaying && matchedPairs.length === questionData.length && (
            <div className="game-complete">
              <h2>🎉 게임 완료! 🎉</h2>
              <p>축하합니다! 모든 카드를 매칭했습니다!</p>
              <div className="final-stats">
                <p>최종 점수: {score}점</p>
                <p>총 이동: {moves}회</p>
                <p>소요 시간: {formatTime(timer)}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardMain;
