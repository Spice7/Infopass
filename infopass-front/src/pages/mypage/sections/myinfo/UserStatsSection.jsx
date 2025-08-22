import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { FlashOn, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import api from '@/user/api'; // JWT 헤더 포함 axios 객체
import './UserStatsSection.css';

const primaryColor = '#a55eea';
const gradientColor = 'linear-gradient(135deg, #a55eea 0%, #dcdde1 100%)';
const cardBgColor = 'rgba(46, 46, 78, 0.8)';
const textColor = '#e8eaf6';
const MAX_EXP_PER_LEVEL = 100;

const UserStatsSection = ({ user }) => {
  const navigate = useNavigate(); // ✅ React Router 이동
  const [progress, setProgress] = useState(0);
  const [userRank, setUserRank] = useState(null);

  const expProgress = (user?.exp / MAX_EXP_PER_LEVEL) * 100 || 0;
  const expRemaining = MAX_EXP_PER_LEVEL - (user?.exp || 0);

  // 경험치 애니메이션
  useEffect(() => {
    let start = 0;
    const duration = 1500;
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

  // 사용자 랭킹 API 호출
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user?.id) {
        console.log("유저 ID가 없어서 API 호출을 건너뜁니다.");
        return;
      }

      try {
        const response = await api.get(`/rank/${user.id}`);
        console.log("API 응답 데이터:", response.data);

        if (response.data && response.data.player_rank !== undefined) {
          setUserRank(response.data.player_rank);
          console.log(`랭킹 데이터 설정 완료: ${response.data.player_rank}위`);
        } else {
          console.log("응답 데이터에 'player_rank' 필드가 없거나 정의되지 않았습니다.");
          setUserRank(null);
        }
      } catch (error) {
        console.error("랭킹 데이터를 가져오는 데 실패했습니다:", error);
        setUserRank(null);
      }
    };

    fetchUserRank();
  }, [user?.id]);

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
          <Typography variant="body1" fontWeight={700} sx={{ color: textColor }}>
            {user?.exp || 0} / {MAX_EXP_PER_LEVEL}
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 14,
              borderRadius: 7,
              background: '#4d4d75',
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
          background: 'linear-gradient(45deg, #2c2c3c 0%, #3e3e5a 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'transform 0.32s cubic-bezier(.2,.8,.2,1), box-shadow 0.32s ease',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 22px 50px rgba(0,0,0,0.12)' },
          cursor: 'pointer', // ✅ 클릭 가능 표시
        }}
        onClick={() => navigate('/rank')} // ✅ 클릭 시 랭킹 페이지로 이동
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
              background: 'linear-gradient(45deg, #c56cf0 30%, #a55eea 90%)',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '4.5rem',
              animation: 'popIn 640ms cubic-bezier(.2,.85,.2,1) both',
              transition: 'transform 0.28s cubic-bezier(.2,.8,.2,1)',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          >
            {userRank !== null ? `${userRank}위` : '0위'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
            마이페이지는 매일 01시 랭킹 갱신됩니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserStatsSection;
