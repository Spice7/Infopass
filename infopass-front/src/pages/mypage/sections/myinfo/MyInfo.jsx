import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Box, CircularProgress, Typography } from '@mui/material';

import UserProfileCard from './UserProfileCard';      // 프로필 카드 컴포넌트 import
import UserStatsSection from './UserStatsSection';    // 스탯(경험치, 랭킹) 컴포넌트 import

import * as auth from '../../../../user/auth';

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

    auth.info(token)
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // **UserProfileCard에서 프로필 수정 후 변경된 데이터를 받는 함수**
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

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
      {/* 수정된 onUpdate 콜백 전달! */}
      <UserProfileCard user={user} onUpdate={handleUserUpdate} />
      <UserStatsSection user={user} />
    </Box>
  );
};

export default MyInfo;
