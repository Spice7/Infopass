import React from 'react';

const GameControls = ({ onRestart, showNextButton, onNextQuestions }) => {
  return (
    <>
      <div className="game-controls">
        <button className="restart-button" onClick={onRestart}>
          게임 재시작
        </button>
      </div>
      {showNextButton && (
        <div className="next-question-btn-wrap" style={{ textAlign: 'center', margin: '20px 0' }}>
          <button className="next-question-btn" onClick={onNextQuestions}>
            다음 문제로 ▶
          </button>
        </div>
      )}
    </>
  );
};

export default GameControls;
