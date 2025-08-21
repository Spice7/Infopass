import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import UserProfileCard from './UserProfileCard';
import UserStatsSection from './UserStatsSection';

import * as auth from '../../../../user/auth';
import * as gameResult from '@/user/gameResult.js'

const primaryColor = '#4a90e2';

const MyInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        await gameResult.checkLevelUp();
        const userRes = await auth.info();
        setUser(userRes.data);
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // 로딩 화면
  if (loading) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          mt: 12,
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <HourglassEmptyIcon sx={{ fontSize: 60, color: primaryColor }} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
          사용자 정보를 불러오는 중입니다...
        </Typography>
        <CircularProgress sx={{ color: primaryColor, mt: 3 }} />
      </Paper>
    );
  }

  // 오류 화면
  if (!user) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          mt: 12,
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: '#fff3f3',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main' }} />
        <Typography variant="h6" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
          사용자 정보를 불러오지 못했습니다
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
          네트워크 상태를 확인하시고 다시 시도해주세요.
        </Typography>
        
      </Paper>
    );
  }

  // 정상 화면
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        boxSizing: 'border-box',
        py: 6,
      }}
    >
      <UserProfileCard user={user} onUpdate={handleUserUpdate} />
      <UserStatsSection user={user} />
    </Box>
  );
};

export default MyInfo;
