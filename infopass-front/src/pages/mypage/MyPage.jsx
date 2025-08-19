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
    <Box
      sx={{
        display: 'flex',
        bgcolor: 'transparent',
        height: 'calc(80vh - 60px)', // 헤더 높이만큼 줄이기
        mt: '60px',                   // 헤더 아래로 내리기
      }}
    >
      {/* 사이드바 */}
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: 'calc(100vw - 280px)',
          boxSizing: 'border-box',
          p: 2,
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
            height: 'auto',
          overflow: 'visible', // 스크롤바 숨기기
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 900,
            height: '100%',
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
