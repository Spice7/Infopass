import React from 'react';

const GameModeSelector = ({ gameMode, onModeChange, onStartGame }) => {
  return (
    <div className="game-start">
      <div className="game-mode-selector">
        <h3>게임 모드를 선택하세요</h3>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${gameMode === 'normal' ? 'active' : ''}`}
            onClick={() => onModeChange('normal')}
          >
            🎯 일반 모드
          </button>
          <button
            className={`mode-btn ${gameMode === 'timeAttack' ? 'active' : ''}`}
            onClick={() => onModeChange('timeAttack')}
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
      <button className="start-button" onClick={onStartGame}>
        게임 시작
      </button>
    </div>
  );
};

export default GameModeSelector;
