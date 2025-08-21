import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { FlashOn, EmojiEvents } from '@mui/icons-material';
import './UserStatsSection.css';

// ----------------------------------------------------
// 🎨 우주 컨셉에 맞게 색상 변경
// ----------------------------------------------------
const primaryColor = '#a55eea';
const gradientColor = 'linear-gradient(135deg, #a55eea 0%, #dcdde1 100%)';
const cardBgColor = 'rgba(46, 46, 78, 0.8)'; // 어두운 보라색 계열 (투명도 조절)
const textColor = '#e8eaf6'; // 밝은 글자색
const MAX_EXP_PER_LEVEL = 100;

const UserStatsSection = ({ user }) => {
  const [progress, setProgress] = useState(0);

  const expProgress = (user.exp / MAX_EXP_PER_LEVEL) * 100;
  const expRemaining = MAX_EXP_PER_LEVEL - user.exp;

  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5초
    const stepTime = 15;
    const increment = expProgress / (duration / stepTime);
    const timer = setInterval(() => {
      start += increment;
      if (start >= expProgress) {
        start = expProgress;
        clearInterval(timer);
      }
      setProgress(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [expProgress]);

  return (
    <Box
      className="fade-in"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        width: '100%',
        maxWidth: 900,
        flexWrap: 'wrap',
      }}
    >
      {/* 경험치 카드 */}
      <Card
        elevation={10}
        sx={{
          flex: '1 1 400px',
          p: 4,
          borderRadius: 4,
          background: cardBgColor,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          minWidth: 300,
          transition: 'transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s ease',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 48px rgba(0,0,0,0.12)' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: textColor, display: 'flex', alignItems: 'center' }}>
            <FlashOn sx={{ mr: 1, color: '#ffc107' }} />
            경험치 (EXP)
          </Typography>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{
              color: textColor,
              transition: 'color .25s ease, transform .25s ease',
            }}
          >
            {user.exp} / {MAX_EXP_PER_LEVEL}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 14,
              borderRadius: 7,
              background: '#4d4d75', // 어두운 배경색
              '& .MuiLinearProgress-bar': {
                background: gradientColor,
                transition: 'width 0.15s linear',
              },
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: textColor }} textAlign="right">
          다음 레벨까지 <b style={{ color: primaryColor }}>{expRemaining} EXP</b> 남음 🚀
        </Typography>
      </Card>

      {/* 랭킹 카드 */}
      <Card
        elevation={10}
        sx={{
          flex: '0 0 220px',
          borderRadius: 4,
          textAlign: 'center',
          p: 2,
          background: 'linear-gradient(45deg, #2c2c3c 0%, #3e3e5a 100%)', // 어두운 우주 배경
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'transform 0.32s cubic-bezier(.2,.8,.2,1), box-shadow 0.32s ease',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 22px 50px rgba(0,0,0,0.12)' },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, color: '#dcdde1' }}
          >
            <EmojiEvents sx={{ color: '#ff9800', mr: 1, transition: 'transform .3s ease' }} />
            랭킹 순위
          </Typography>
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(45deg, #c56cf0 30%, #a55eea 90%)', // 보라색 그라데이션
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '4.5rem',
              animation: 'popIn 640ms cubic-bezier(.2,.85,.2,1) both',
              transition: 'transform 0.28s cubic-bezier(.2,.8,.2,1)',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          >
            {user.rank ?? '0'}위
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserStatsSection;