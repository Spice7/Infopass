import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

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

// 관리자 전용 스타일 (더 넓고 어두운 테마)
const adminDialogStyle = {
  borderRadius: 3,
  p: 3,
  bgcolor: '#2d3748',
  color: '#e2e8f0',
  minWidth: 400,
};

const adminButtonStyle = {
  borderRadius: 2,
  px: 4,
  minWidth: 120,
  borderColor: '#4a5568',
  color: '#e2e8f0',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#718096' },
};

// 기본 확인 다이얼로그 컴포넌트
export const ConfirmDialog = ({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "확인", 
  cancelText = "취소",
  isAdmin = false 
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    PaperProps={{ sx: isAdmin ? adminDialogStyle : commonDialogStyle }}
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
      <Button 
        variant="outlined" 
        onClick={onConfirm} 
        sx={isAdmin ? adminButtonStyle : commonButtonStyle}
      >
        {confirmText}
      </Button>
      <Button 
        variant="outlined" 
        onClick={onCancel} 
        sx={isAdmin ? adminButtonStyle : commonButtonStyle}
      >
        {cancelText}
      </Button>
    </DialogActions>
  </Dialog>
);

// 기본 알림 다이얼로그 컴포넌트
export const AlertDialog = ({ 
  open, 
  title, 
  message, 
  onConfirm, 
  confirmText = "확인",
  isAdmin = false 
}) => (
  <Dialog
    open={open}
    PaperProps={{ sx: isAdmin ? adminDialogStyle : commonDialogStyle }}
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
      <Button 
        variant="outlined" 
        onClick={onConfirm} 
        sx={isAdmin ? adminButtonStyle : commonButtonStyle}
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

// 에러 다이얼로그 (빨간색 테마)
export const ErrorDialog = ({ 
  open, 
  title = "오류", 
  message, 
  onConfirm, 
  confirmText = "확인",
  isAdmin = false 
}) => {
  const errorStyle = isAdmin ? {
    ...adminDialogStyle,
    bgcolor: '#742a2a',
    color: '#fed7d7'
  } : {
    ...commonDialogStyle,
    bgcolor: '#c53030',
    color: '#fed7d7'
  };

  const errorButtonStyle = isAdmin ? {
    ...adminButtonStyle,
    borderColor: '#f56565',
    color: '#fed7d7',
    '&:hover': { bgcolor: 'rgba(245,101,101,0.2)', borderColor: '#fc8181' },
  } : {
    ...commonButtonStyle,
    borderColor: '#f56565',
    color: '#fed7d7',
    '&:hover': { bgcolor: 'rgba(245,101,101,0.2)' },
  };

  return (
    <Dialog
      open={open}
      PaperProps={{ sx: errorStyle }}
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
        <Button 
          variant="outlined" 
          onClick={onConfirm} 
          sx={errorButtonStyle}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 성공 다이얼로그 (초록색 테마)
export const SuccessDialog = ({ 
  open, 
  title = "성공", 
  message, 
  onConfirm, 
  confirmText = "확인",
  isAdmin = false 
}) => {
  const successStyle = isAdmin ? {
    ...adminDialogStyle,
    bgcolor: '#2d5016',
    color: '#c6f6d5'
  } : {
    ...commonDialogStyle,
    bgcolor: '#38a169',
    color: '#c6f6d5'
  };

  const successButtonStyle = isAdmin ? {
    ...adminButtonStyle,
    borderColor: '#68d391',
    color: '#c6f6d5',
    '&:hover': { bgcolor: 'rgba(104,211,145,0.2)', borderColor: '#9ae6b4' },
  } : {
    ...commonButtonStyle,
    borderColor: '#68d391',
    color: '#c6f6d5',
    '&:hover': { bgcolor: 'rgba(104,211,145,0.2)' },
  };

  return (
    <Dialog
      open={open}
      PaperProps={{ sx: successStyle }}
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
        <Button 
          variant="outlined" 
          onClick={onConfirm} 
          sx={successButtonStyle}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};