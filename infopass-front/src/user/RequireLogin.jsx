import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

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
        </DialogActions>
      </Dialog>
    );
  }

  return children;
};

export default RequireLogin;


