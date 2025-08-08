import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';
import { LoginContext } from '../../../../user/LoginContextProvider';
import Cookies from 'js-cookie';
import UserProfileCard from './UserProfileCard'; // 새로 생성할 컴포넌트
import UserStatsSection from './UserStatsSection'; // 새로 생성할 컴포넌트

const primaryColor = '#4a90e2';

const MyInfo = () => {
  const { accessToken } = useContext(LoginContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = accessToken || Cookies.get('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get('http://localhost:9000/user/info', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken]);

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