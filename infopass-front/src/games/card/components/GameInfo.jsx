import React from 'react';

const GameInfo = ({ 
  score, 
  moves, 
  gameMode, 
  remainingTime, 
  timer, 
  matchedPairs, 
  formatTime
}) => {

  return (
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
         <span className="value">
           {Math.round((matchedPairs.length / 8) * 100)}%
         </span>
       </div>
    </div>
  );
};

export default GameInfo;
