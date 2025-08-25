import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { FlashOn } from '@mui/icons-material';

const primaryColor = '#a55eea';
const gradientColor = 'linear-gradient(135deg, #a55eea 0%, #dcdde1 100%)';
const textColor = '#e8eaf6';
const MAX_EXP_PER_LEVEL = 100;

const GameTimeout = ({ score, moves, matchedPairs, sessionExp, showExpAnimation, expCount, userLevel, showLevelUp, expBarAnimation, expBarFrom, expBarTo, animatedExp, animatedLevel, onRestart, onExitToMenu }) => {
  // 애니메이션 상태 초기화
  useEffect(() => {
    if (expBarAnimation) {
      // useCardGame에서 이미 애니메이션을 처리하므로 여기서는 초기화만
      console.log('애니메이션 상태 동기화:', { expBarFrom, expBarTo });
    }
  }, [expBarAnimation, expBarFrom, expBarTo]);

  // 경험치 퍼센트 계산
  const expProgress = (animatedExp / MAX_EXP_PER_LEVEL) * 100;
  const expRemaining = MAX_EXP_PER_LEVEL - animatedExp;

  return (
    <div className="game-timeout" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      maxWidth: '100%',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h2>⏰ 시간 초과! ⏰</h2>
      <p>제한 시간 내에 게임을 완료하지 못했습니다.</p>
      
      {/* Material-UI 스타일의 경험치 카드 */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: 'rgba(46, 46, 78, 0.9)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ 
              color: textColor, 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '1.1rem'
            }}
          >
            <FlashOn sx={{ mr: 1, color: '#ffc107', fontSize: '1.2rem' }} />
            경험치 (EXP)
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ color: textColor }}>
            {Math.floor(animatedExp)} / {MAX_EXP_PER_LEVEL}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={expProgress}
            sx={{
              height: 12,
              borderRadius: 6,
              background: '#4d4d75',
              '& .MuiLinearProgress-bar': {
                background: gradientColor,
                transition: 'width 0.3s ease-out',
              },
            }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, color: textColor }} textAlign="right">
          다음 레벨까지 <b style={{ color: primaryColor }}>{Math.floor(expRemaining)} EXP</b> 남음 🚀
        </Typography>
        
        {/* 레벨 표시 */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor }}>
            Level {animatedLevel}
          </Typography>
        </Box>
      </Box>
      
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
          <p className="practice-mode">타임어택 - 경험치 없음</p>
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
