import React from 'react';

const GameComplete = ({ score, moves, gameMode, remainingTime, timer, sessionExp, showExpAnimation, expCount, userLevel, userExp, showLevelUp, expBarAnimation, expBarFrom, expBarTo, expBarPercent, expBarTransitionEnabled, onRestart, onExitToMenu, formatTime }) => {

  return (
    <div className="game-complete">
      <h2>🎉 게임 완료! 🎉</h2>
      <p>축하합니다! 모든 카드를 매칭했습니다!</p>
      
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
                width: `${expBarPercent}%`,
                transition: expBarTransitionEnabled ? 'width 1s ease-in-out' : 'none'
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
        {gameMode === 'timeAttack' ? (
          <p>남은 시간: {formatTime(remainingTime)}</p>
        ) : (
          <p>소요 시간: {formatTime(timer)}</p>
        )}
        <p>게임 모드: {gameMode === 'timeAttack' ? '타임어택' : '연습모드'}</p>
        {sessionExp > 0 && (
          <p className="exp-gained">획득한 경험치: +{sessionExp}</p>
        )}
        {sessionExp === 0 && (
          <p className="practice-mode">연습모드 - 경험치 없음</p>
        )}
      </div>
      <div className="game-complete-buttons">
        <button type="button" onClick={onRestart}>게임 재시작</button>
        <button type="button" onClick={onExitToMenu}>게임종료</button>
      </div>
    </div>
  );
};

export default GameComplete;
