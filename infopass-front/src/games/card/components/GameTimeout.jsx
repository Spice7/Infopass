import React from 'react';

const GameTimeout = ({ score, moves, matchedPairs, onRestart, onExitToMenu }) => {
  return (
    <div className="game-timeout">
      <h2>⏰ 시간 초과! ⏰</h2>
      <p>제한 시간 내에 게임을 완료하지 못했습니다.</p>
      <div className="final-stats">
        <p>최종 점수: {score}점</p>
        <p>총 이동: {moves}회</p>
        <p>완료된 매칭: {matchedPairs.length}개</p>
      </div>
      <div className="game-timeout-buttons">
        <button type="button" onClick={onRestart}>게임 재시작</button>
        <button type="button" onClick={onExitToMenu}>게임종료</button>
      </div>
    </div>
  );
};

export default GameTimeout;
