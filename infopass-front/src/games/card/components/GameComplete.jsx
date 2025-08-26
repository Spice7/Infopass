import React, { useEffect } from 'react';
import ExpBar from '../../../components/ExpBar';

const GameComplete = ({ score, moves, gameMode,  sessionExp, showExpAnimation, expCount,  showLevelUp, expBarAnimation, expBarFrom, expBarTo, animatedExp, animatedLevel, onRestart, onExitToMenu, matchedPairs }) => {
  // 애니메이션 상태 초기화
  useEffect(() => {
    if (expBarAnimation) {
      // useCardGame에서 이미 애니메이션을 처리하므로 여기서는 초기화만
      console.log('애니메이션 상태 동기화:', { expBarFrom, expBarTo });
    }
  }, [expBarAnimation, expBarFrom, expBarTo]);

  return (
    <div className="game-complete" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      maxWidth: '100%',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h2>🎉 게임 완료! 🎉</h2>
      <p>축하합니다! 모든 카드를 매칭했습니다!</p>
      
      {/* 공용 경험치 바 컴포넌트 */}
      <ExpBar
        animatedExp={animatedExp}
        animatedLevel={animatedLevel}
        showLevelUp={showLevelUp}
        showExpAnimation={showExpAnimation}
        expCount={expCount}
        sessionExp={sessionExp}
        gameMode={gameMode}
      />
      
      <div className="final-stats">
        <p>최종 점수: {score}점</p>
        <p>총 이동: {moves}회</p>
        <p>완료된 매칭: {matchedPairs?.length || 0}개</p>
        {sessionExp > 0 && (
          <p className="exp-gained">획득한 경험치: +{sessionExp}</p>
        )}
        {sessionExp === 0 && (
          <p className="practice-mode">일반 모드 - 경험치 없음</p>
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
