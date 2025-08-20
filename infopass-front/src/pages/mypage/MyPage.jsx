import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import MyInfo from './sections/myinfo/MyInfo';
import WrongNotes from './sections/WrongNotes';
import GameRecord from './sections/GameRecord';
import Inquiries from './sections/Inquiries';
import { useSearchParams } from 'react-router-dom';

const MyPage = () => {
  const [searchParams] = useSearchParams(); // menu에서 선택한 항목에 따라 쿼리 파라미터 설정
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

  // URL ?tab= 값에 따라 초기 탭 동기화
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;
    switch (tab) {
      case 'wrong':
        setSelectedMenu('오답노트');
        break;
      case 'records':
        setSelectedMenu('게임 기록');
        break;
      case 'inquiries':
        setSelectedMenu('문의 내역');
        break;
      case 'info':
        setSelectedMenu('내 정보');
        break;
      default:
        break;
    }
  }, [searchParams]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f9faff',
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
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          overflow: 'hidden',
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
