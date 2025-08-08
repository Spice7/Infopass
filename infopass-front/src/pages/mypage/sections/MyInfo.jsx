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
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import { AccountCircle, Edit, Star } from '@mui/icons-material';

const brandColor = '#1976d2';
const MAX_EXP_PER_LEVEL = 100;

const MyInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:9000/mypage/1')
      .then((res) => {
        console.log('User data fetched:', res);
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
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
        elevation={8}
        sx={{
          p: { xs: 3, md: 5 },
          minHeight: 260,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
          mb: 5,
          borderRadius: 4,
          width: '100%',
          maxWidth: 820,
          position: 'relative',
          background: 'linear-gradient(135deg, #e3f2fd 60%, #fce4ec 100%)',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.13)',
        }}
      >
        <Box sx={{ position: 'relative', mr: { md: 3 } }}>
          <Avatar
            sx={{
              bgcolor: brandColor,
              width: 120,
              height: 120,
              fontSize: 80,
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.18)',
              border: '4px solid #fff',
              background: 'linear-gradient(135deg, #1976d2 60%, #26c6da 100%)',
            }}
          >
            <AccountCircle fontSize="inherit" />
          </Avatar>
          <Tooltip title={`레벨 ${user.level}`}>
            <Chip
              icon={<Star sx={{ color: '#fff' }} />}
              label={`Lv.${user.level}`}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: '#ffb300',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                px: 1.5,
                boxShadow: 2,
              }}
            />
          </Tooltip>
        </Box>
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: brandColor }}>
            {user.name}
            <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 1 }}>
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
          sx={{
            position: { xs: 'static', md: 'absolute' },
            top: 32,
            right: 32,
            mt: { xs: 2, md: 0 },
            bgcolor: brandColor,
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.13)',
            '&:hover': {
              bgcolor: '#1565c0',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.18)',
            },
          }}
        >
          수정
        </Button>
      </Paper>

      <Card elevation={10} sx={{
        width: '100%',
        maxWidth: 820,
        p: 4,
        mb: 5,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.10)',
      }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: brandColor }}>
          경험치
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={expProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                background: '#e3f2fd',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1976d2 60%, #26c6da 100%)',
                },
              }}
            />
          </Box>
          <Typography variant="body1" fontWeight={700}>
            {user.exp} / {MAX_EXP_PER_LEVEL}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="right">
          다음 레벨까지 <b style={{ color: brandColor }}>{expRemaining} XP</b> 남음
        </Typography>
      </Card>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={6} sx={{
            borderRadius: 3,
            height: '100%',
            textAlign: 'center',
            p: 3,
            background: 'linear-gradient(135deg, #e3f2fd 60%, #fce4ec 100%)',
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.10)',
          }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                퀴즈 정답률
              </Typography>
              <Typography variant="h2" fontWeight={800} color={brandColor}>
                75%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={6} sx={{
            borderRadius: 3,
            height: '100%',
            textAlign: 'center',
            p: 3,
            background: 'linear-gradient(135deg, #fce4ec 60%, #e3f2fd 100%)',
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.10)',
          }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                랭킹 순위
              </Typography>
              <Typography variant="h2" fontWeight={800} color={brandColor}>
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
