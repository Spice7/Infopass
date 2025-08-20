import React from 'react';

const GameComplete = ({ score, moves, gameMode, remainingTime, timer, onRestart, onExitToMenu, formatTime }) => {

  return (
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
      <div className="game-complete-buttons">
        <button type="button" onClick={onRestart}>게임 재시작</button>
        <button type="button" onClick={onExitToMenu}>게임종료</button>
      </div>
    </div>
  );
};

export default GameComplete;
