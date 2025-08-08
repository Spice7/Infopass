// MyPage.jsx
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
    <Box sx={{ display: 'flex', bgcolor: '#f9faff' }}> {/* height: '100vh' 제거 */}
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <Box component="main"
      sx={{
        flexGrow: 1,
        width: 'calc(100vw - 280px)', // Sidebar width와 동일하게 맞춤
        // height: '100vh', 제거
        boxSizing: 'border-box',
        p: 5,
        overflowY: 'auto', // overflowY: 'auto'는 그대로 유지
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 900 }}>{renderMainContent()}</Box>
      </Box>
    </Box>
  );
};

export default MyPage;