import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import MyInfo from './sections/myinfo/MyInfo';
import WrongNotes from './sections/WrongNotes/WrongNotes.jsx';
import GameRecord from './sections/GameRecord';
import InquiryForm from './sections/InquiryForm.jsx';
import InquiryList from './sections/InquiryList.jsx';

const MyPage = () => {
  const [searchParams] = useSearchParams(); // menu에서 선택한 항목에 따라 쿼리 파라미터 설정
  const [selectedMenu, setSelectedMenu] = useState('내 정보');
  const [loading] = useState(false);

  // 로그인 가드는 라우트에서 처리되므로 이 컴포넌트에서는 별도 체크를 하지 않습니다.

  const renderMainContent = () => {
    switch (selectedMenu) {
      case '내 정보':
        return <MyInfo />;
      case '오답노트':
        return <WrongNotes />;
      case '게임 기록':
        return <GameRecord />;
      case '문의 하기':
       return <InquiryForm setSelectedMenu={setSelectedMenu} />;
        case '문의 내역':
        return <InquiryList />;
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

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 로그인 Dialog는 상위 라우트에서 RequireLogin이 처리

  return (
    <Box sx={{ display: 'flex', bgcolor: 'transparent', height: 'calc(80vh - 60px)', mt: '60px' }}>
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <Box component="main" sx={{ flexGrow: 1, width: 'calc(100vw - 280px)', p: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 900, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderMainContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default MyPage;