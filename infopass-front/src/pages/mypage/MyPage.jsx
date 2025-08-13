import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import MyInfo from './sections/myinfo/MyInfo';
import WrongNotes from './sections/WrongNotes';
import GameRecord from './sections/GameRecord';
import Inquiries from './sections/Inquiries';

const MyPage = () => {
  const [selectedMenu, setSelectedMenu] = useState('내 정보');

  const renderMainContent = () => {
    switch (selectedMenu) {
      case '내 정보':
        return <MyInfo />;
      case '오답노트':
        return <WrongNotes />;
      case '게임 기록':
        return <GameRecord />;
      case '문의 내역':
        return <Inquiries />;
      default:
        return <MyInfo />;
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9faff', height: '80vh' }}>
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: 'calc(100vw - 280px)',
          boxSizing: 'border-box',
          p: 2,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',      // 부모 박스 꽉 채우기
          overflow: 'hidden',  // 스크롤 없음
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 900,
            height: '100%',      // 내부 꽉 채우기
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderMainContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default MyPage;
