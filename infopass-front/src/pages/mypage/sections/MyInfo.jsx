import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  LinearProgress,
} from '@mui/material';
import { AccountCircle, Edit } from '@mui/icons-material';

const brandColor = '#1976d2';
const MAX_EXP_PER_LEVEL = 100;

const MyInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const dummyUser = {
      id: 1,
      name: '홍길동',
      nickname: '길동이',
      email: 'hong123@gmail.com',
      phone: '010-1234-5678',
      address: '서울시 강남구 역삼동',
      usertype: 'USER',
      exp: 75,
      level: 7,
      rank_updated_at: '2025-08-01T15:30:00',
      created_at: '2024-05-10T10:20:00',
    };

    setTimeout(() => {
      setUser(dummyUser);
    }, 500);
  }, []);

  if (!user) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          사용자 정보를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  const expProgress = (user.exp / MAX_EXP_PER_LEVEL) * 100;
  const expRemaining = MAX_EXP_PER_LEVEL - user.exp;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 900,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          minHeight: 250,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 3,
          mb: 4,
          borderRadius: 3,
          width: '100%',
          maxWidth: 800,
          position: 'relative',
        }}
      >
        <Avatar sx={{ bgcolor: brandColor, width: 120, height: 120 }}>
          <AccountCircle sx={{ fontSize: 80 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {user.name} <Typography component="span" variant="h5" color="text.secondary">({user.nickname})</Typography>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1.5 }}>
            {user.email}
          </Typography>

          {/* <br> 태그를 사용하여 강제 줄바꿈 */}
          <Typography variant="body1" color="text.secondary">
            전화번호: {user.phone} <br />
            주소: {user.address} <br />
            


            
            가입일: {user.created_at.substring(0, 10)}
          </Typography>
          
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          sx={{ position: { xs: 'static', md: 'absolute' }, top: 20, right: 20, mt: { xs: 2, md: 0 } }}
        >
          수정
        </Button>
      </Paper>

      {/* 경험치 진행바와 레벨 정보 */}
      <Card elevation={8} sx={{ width: '100%', maxWidth: 800, p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          레벨 {user.level}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={expProgress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Typography variant="body1" fontWeight={700}>
            {user.exp} / {MAX_EXP_PER_LEVEL}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="right">
          다음 레벨까지 {expRemaining} XP 남음
        </Typography>
      </Card>

      {/* 주요 정보 카드들 (원하는 정보로 수정) */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Card elevation={8} sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                퀴즈 정답률
              </Typography>
              <Typography variant="h3" fontWeight={700} color={brandColor}>
                75 %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Card elevation={8} sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                랭킹 순위
              </Typography>
              <Typography variant="h3" fontWeight={700} color={brandColor}>
                12위
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyInfo;