import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

import './UserProfileCard.css';
import { update } from '../../../../user/auth';


const primaryColor = '#4a90e2';
const gradientColor = 'linear-gradient(135deg, #4a90e2 0%, #81d4fa 100%)';
const cardBgColor = '#ffffff';

const UserProfileCard = ({ user, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? '',
    nickname: user.nickname ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setForm({
      name: user.name ?? '',
      nickname: user.nickname ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 수정 저장 함수
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // /user/{id} 로 PUT 요청
      const response = await update(user.id, form);

      if (response.status === 200) {
        if (onUpdate) onUpdate(response.data);
        setOpen(false);
      } else {
        setError('업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        className="fade-in-up"
        elevation={10}
        sx={{
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 4,
          mb: 6,
          borderRadius: 4,
          width: '100%',
          maxWidth: 900,
          position: 'relative',
          background: cardBgColor,
          boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: primaryColor }}>
            {user.name}
            <Typography
              component="span"
              variant="h5"
              color="text.secondary"
              sx={{ ml: 1, fontWeight: 500 }}
            >
              ({user.nickname ?? '닉네임 없음'})
            </Typography>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            {user.email}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            <b>전화번호:</b> {user.phone}
            <br />
            <b>주소:</b> {user.address}
            <br />
            <b>가입일:</b> {user.created_at?.substring(0, 10)}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Edit />}
          sx={{
            position: { xs: 'static', md: 'absolute' },
            top: 32,
            right: 32,
            mt: { xs: 4, md: 0 },
            background: gradientColor,
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            '&:hover': {
              background: gradientColor,
              transform: 'scale(1.05)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
            },
          }}
          onClick={handleOpen}
        >
          프로필 수정
        </Button>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>프로필 수정</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}
            noValidate
            autoComplete="off"
          >
            <TextField label="이름" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField label="닉네임" name="nickname" value={form.nickname} onChange={handleChange} fullWidth />
            <TextField label="전화번호" name="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="주소" name="address" value={form.address} onChange={handleChange} fullWidth />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfileCard;
