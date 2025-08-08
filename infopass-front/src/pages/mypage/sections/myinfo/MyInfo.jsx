import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Box, CircularProgress, Typography } from '@mui/material';
import UserProfileCard from './UserProfileCard';
import UserStatsSection from './UserStatsSection';
import * as auth from '../../../../user/auth';

const primaryColor = '#4a90e2';

const MyInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MyInfo 컴포넌트가 마운트되었습니다.');
    const token = Cookies.get('accessToken');
    console.log('MyInfo - token from cookie:', token);

    if (!token) {
      console.log('토큰이 없습니다.');
      setLoading(false);
      return;
    }

    auth.info(token)
      .then((res) => {
        console.log('사용자 정보 가져오기 성공:', res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: primaryColor }} />
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
      <UserProfileCard user={user} />
      <UserStatsSection user={user} />
    </Box>
  );
};

export default MyInfo;
