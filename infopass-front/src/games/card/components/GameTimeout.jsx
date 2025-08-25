import React from 'react';

const GameTimeout = ({ score, moves, matchedPairs, sessionExp, showExpAnimation, expCount, userLevel, userExp, showLevelUp, expBarAnimation, expBarFrom, expBarTo, onRestart, onExitToMenu }) => {

  return (
    <div className="game-timeout">
      <h2>⏰ 시간 초과! ⏰</h2>
      <p>제한 시간 내에 게임을 완료하지 못했습니다.</p>
      
      {/* 사용자 정보 및 경험치 바 */}
      <div className="user-info">
        <div className="user-level">
          <span className="level-label">Level {userLevel}</span>
        </div>
        <div className="exp-bar-container">
          <div className="exp-bar">
            <div 
              className="exp-bar-fill"
              style={{
                width: expBarAnimation ? `${(expBarTo % 100)}%` : `${(userExp % 100)}%`,
                transition: expBarAnimation ? 'width 1s ease-in-out' : 'none'
              }}
            />
          </div>
          <span className="exp-text">
            {expBarAnimation ? `${expBarFrom % 100} → ${expBarTo % 100}` : `${userExp % 100}`}/100
          </span>
        </div>
      </div>
      
      {/* 경험치 증가 애니메이션 */}
      {showExpAnimation && (
        <div className="exp-animation">
          <div className="exp-icon">⭐</div>
          <div className="exp-text">
            <span className="exp-label">경험치 획득!</span>
            <span className="exp-value">+{expCount}</span>
          </div>
        </div>
      )}
      
      {/* 레벨업 애니메이션 */}
      {showLevelUp && (
        <div className="level-up-animation">
          <div className="level-up-icon">🎊</div>
          <div className="level-up-text">
            <span className="level-up-label">레벨업!</span>
            <span className="level-up-value">Level {userLevel}</span>
          </div>
        </div>
      )}
      
      <div className="final-stats">
        <p>최종 점수: {score}점</p>
        <p>총 이동: {moves}회</p>
        <p>완료된 매칭: {matchedPairs.length}개</p>
        {sessionExp > 0 && (
          <p className="exp-gained">획득한 경험치: +{sessionExp}</p>
        )}
        {sessionExp === 0 && (
          <p className="practice-mode">연습모드 - 경험치 없음</p>
        )}
      </div>
      <div className="game-timeout-buttons">
        <button type="button" onClick={onRestart}>게임 재시작</button>
        <button type="button" onClick={onExitToMenu}>게임종료</button>
      </div>
    </div>
  );
};

export default GameTimeout;
