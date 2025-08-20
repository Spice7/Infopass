import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Sidebar from './Sidebar';
import MyInfo from './sections/myinfo/MyInfo';
import WrongNotes from './sections/WrongNotes';
import GameRecord from './sections/GameRecord';
import Inquiries from './sections/Inquiries';

const MyPage = () => {
  const [selectedMenu, setSelectedMenu] = useState('내 정보');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setOpenDialog(true);
    }
  }, []);

  const handleConfirm = () => {
    setOpenDialog(false);
    navigate('/login'); // 로그인 페이지로 이동
  };

  const handleCancel = () => {
    setOpenDialog(false);
    navigate('/'); // 메인 페이지로 이동 (혹은 이전 페이지로 돌리기)
  };

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
    <Box sx={{ display: 'flex', bgcolor: 'transparent', height: 'calc(80vh - 60px)', mt: '60px' }}>
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <Box component="main" sx={{ flexGrow: 1, width: 'calc(100vw - 280px)', p: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 900, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderMainContent()}
        </Box>
      </Box>

      {/* 로그인 필요 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            bgcolor: '#1e2738',
            color: '#fff',
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.25rem' }}>
          로그인 필요
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            로그인이 필요한 서비스입니다. <br /> 로그인하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              borderRadius: 2,
              px: 3,
               minWidth: 100,   // 버튼 최소 너비 고정
                maxWidth: 100,   // 버튼 최소 너비 고정
              borderColor: '#fff',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            아니오
          </Button>

          <Button
            variant="outlined"
            onClick={handleConfirm}
            sx={{
              borderRadius: 2,
              px: 3,
               minWidth: 100,   // 버튼 최소 너비 고정
                maxWidth: 100,   // 버튼 최소 너비 고정
                
              borderColor: '#fff',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPage;
