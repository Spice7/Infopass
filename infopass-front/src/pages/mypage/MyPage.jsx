import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Sidebar from './Sidebar';
import MyInfo from './sections/myinfo/MyInfo';
import WrongNotes from './sections/WrongNotes';
import GameRecord from './sections/GameRecord';
import InquiryForm from './sections/InquiryForm.jsx';
import InquiryList from './sections/InquiryList.jsx';

const MyPage = () => {
  const [selectedMenu, setSelectedMenu] = useState('내 정보');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setOpenDialog(true);
    }
    setLoading(false);
  }, []);

  const handleConfirm = () => {
    // 로그인 페이지로 이동하면서 돌아올 경로 전달
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleCancel = () => {
    navigate('/'); // 메인 페이지 이동
  };

  const renderMainContent = () => {
    switch (selectedMenu) {
      case '내 정보':
        return <MyInfo />;
      case '오답노트':
        return <WrongNotes />;
      case '게임 기록':
        return <GameRecord />;
      case '문의 하기':
        return <InquiryForm />;
        case '문의 내역':
        return <InquiryList />;
      default:
        return <MyInfo />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (openDialog) {
    return (
      <Dialog
        open={true}
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
              minWidth: 100,
              maxWidth: 100,
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
              minWidth: 100,
              maxWidth: 100,
              borderColor: '#fff',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

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
