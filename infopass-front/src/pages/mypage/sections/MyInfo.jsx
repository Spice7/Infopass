import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import { AccountCircle, Edit } from '@mui/icons-material';

const brandColor = '#1976d2';
const MAX_EXP_PER_LEVEL = 100;

const MyInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    axios.get('/api/mypage/user/1') // 백엔드에서 사용자 ID 1번 정보 가져옴
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('유저 정보 가져오기 실패:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          사용자 정보를 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="error">
          사용자 정보를 불러오지 못했습니다.
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
            {user.name}
            <Typography component="span" variant="h5" color="text.secondary">
              ({user.nickname})
            </Typography>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1.5 }}>
            {user.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            전화번호: {user.phone}<br />
            주소: {user.address}<br />
            가입일: {user.createdAt?.substring(0, 10)}
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

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Card elevation={8} sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                퀴즈 정답률
              </Typography>
              <Typography variant="h3" fontWeight={700} color={brandColor}>
                75%
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
