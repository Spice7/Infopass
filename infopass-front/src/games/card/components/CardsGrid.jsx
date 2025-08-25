import React from 'react';

const CardsGrid = ({ 
  cards, 
  onCardClick, 
  onRestart, 
  onNextQuestions, 
  onGameEnd,
  onExitToMenu,
  showNextButton 
}) => {
  return (

    <div className="cards-grid-container">
    <div className="cards-grid">
      {cards.map((card) => (
        <div
          key={card.id}
            className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
          onClick={() => onCardClick(card.id)}
        >
          <div className="card-inner">
            <div className="card-front">
                <span className="card-type">{card.type === 'question' ? 'Q' : 'A'}</span>                
            </div>
            <div className="card-back">
                <span>{card.content}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 게임 컨트롤 버튼들 */}
      <div className="game-controls-overlay">
        <div className="game-controls">
          <button className="restart-button" onClick={onRestart}>
            게임 재시작
          </button>
          
          {showNextButton && (
            <button className="next-question-btn" onClick={onNextQuestions}>
              다음 문제로 ▶
            </button>
          )}
          
          <button className="game-end-btn" onClick={onExitToMenu}>
            게임종료
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardsGrid;
