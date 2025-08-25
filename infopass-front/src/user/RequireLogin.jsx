import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

// 공통 다이얼로그 스타일
const commonDialogStyle = {
  borderRadius: 3,
  p: 2,
  bgcolor: '#1e2738',
  color: '#fff',
  minWidth: 360,
};

const commonButtonStyle = {
  borderRadius: 2,
  px: 3,
  minWidth: 100,
  maxWidth: 100,
  borderColor: '#fff',
  color: '#fff',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
};

// 로그인 필요 다이얼로그 컴포넌트
export const RequireLoginDialog = ({ open, onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{ sx: commonDialogStyle }}
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
      <Button variant="outlined" onClick={onConfirm} sx={commonButtonStyle}>
        확인
      </Button>
      <Button variant="outlined" onClick={onCancel} sx={commonButtonStyle}>
        아니오
      </Button>
    </DialogActions>
  </Dialog>
);

// 로그인 성공 다이얼로그 컴포넌트
export const LoginSuccessDialog = ({ open, onConfirm }) => (
  <Dialog
    open={open}
    PaperProps={{ sx: commonDialogStyle }}
  >
    <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.25rem' }}>
      로그인 성공
    </DialogTitle>
    <DialogContent>
      <Typography align="center">
        환영합니다! 원래 페이지로 이동합니다.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center' }}>
      <Button variant="outlined" onClick={onConfirm} sx={commonButtonStyle}>
        확인
      </Button>
    </DialogActions>
  </Dialog>
);

// 로그아웃 확인 다이얼로그 컴포넌트
export const LogoutConfirmDialog = ({ open, onConfirm, onCancel }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{ sx: commonDialogStyle }}
  >
    <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.25rem' }}>
      로그아웃
    </DialogTitle>
    <DialogContent>
      <Typography align="center">
        정말 로그아웃 하시겠습니까?
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
      <Button variant="outlined" onClick={onConfirm} sx={commonButtonStyle}>
        로그아웃
      </Button>
      <Button variant="outlined" onClick={onCancel} sx={commonButtonStyle}>
        취소
      </Button>
    </DialogActions>
  </Dialog>
);

// 기본 확인 다이얼로그 컴포넌트
export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = "확인", cancelText = "취소" }) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{ sx: commonDialogStyle }}
  >
    <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.25rem' }}>
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography align="center">
        {message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
      <Button variant="outlined" onClick={onConfirm} sx={commonButtonStyle}>
        {confirmText}
      </Button>
      <Button variant="outlined" onClick={onCancel} sx={commonButtonStyle}>
        {cancelText}
      </Button>
    </DialogActions>
  </Dialog>
);

// 기본 알림 다이얼로그 컴포넌트
export const AlertDialog = ({ open, title, message, onConfirm, confirmText = "확인" }) => (
  <Dialog
    open={open}
    PaperProps={{ sx: commonDialogStyle }}
  >
    <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.25rem' }}>
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography align="center">
        {message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center' }}>
      <Button variant="outlined" onClick={onConfirm} sx={commonButtonStyle}>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

// 기존 RequireLogin 컴포넌트
const RequireLogin = ({ children }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      setOpenDialog(true);
    }
  }, []);

  const handleConfirm = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleCancel = () => {
    navigate('/');
  };

  const token = Cookies.get('accessToken');
  if (!token) {
    return (
      <RequireLoginDialog
        open={openDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return children;
};

export default RequireLogin;


