import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { FlashOn, EmojiEvents } from '@mui/icons-material';

const primaryColor = '#4a90e2';
const gradientColor = 'linear-gradient(135deg, #4a90e2 0%, #81d4fa 100%)';
const cardBgColor = '#ffffff';
const MAX_EXP_PER_LEVEL = 100;

const UserStatsSection = ({ user }) => {
  const targetProgress = (user.exp / MAX_EXP_PER_LEVEL) * 100;
  const expRemaining = MAX_EXP_PER_LEVEL - user.exp;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let currentProgress = 0;

    const animate = () => {
      currentProgress += 1; // 1%씩 증가
      if (currentProgress > targetProgress) {
        currentProgress = targetProgress;
      }
      setProgress(currentProgress);

      if (currentProgress < targetProgress) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetProgress]);

  return (
    <Box
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
          <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor, display: 'flex', alignItems: 'center' }}>
            <FlashOn sx={{ mr: 1, color: '#ffc107' }} />
            경험치 (XP)
          </Typography>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{
              color: primaryColor,
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
              background: '#e3f2fd',
              '& .MuiLinearProgress-bar': {
                background: gradientColor,
                transition: 'width 100ms ease-in-out',
              },
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="right" sx={{ mt: 1 }}>
          다음 레벨까지 <b style={{ color: primaryColor }}>{expRemaining} XP</b> 남음 🚀
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
          background: 'linear-gradient(45deg, #fce4ec 0%, #e3f2fd 100%)',
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
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}
          >
            <EmojiEvents sx={{ color: '#ff9800', mr: 1, transition: 'transform .3s ease' }} />
            랭킹 순위
          </Typography>
          <Typography
            variant="h1"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
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
