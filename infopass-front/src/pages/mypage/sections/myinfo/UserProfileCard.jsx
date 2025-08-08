import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { AccountCircle, Edit, Star } from '@mui/icons-material';

import './UserProfileCard.css';  // CSS 애니메이션 포함

const primaryColor = '#4a90e2';
const gradientColor = 'linear-gradient(135deg, #4a90e2 0%, #81d4fa 100%)';
const cardBgColor = '#ffffff';

const UserProfileCard = ({ user, onUpdate }) => {
  const [open, setOpen] = useState(false);

  // 폼 상태
  const [form, setForm] = useState({
    name: user.name ?? '',
    nickname: user.nickname ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
  });

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

  const handleSave = () => {
    // 서버에 업데이트 요청 가능
    console.log('수정된 정보:', form);
    if (onUpdate) onUpdate(form);
    setOpen(false);
  };

  return (
    <>
      <Paper
        className="fade-in-up"  // 여기 애니메이션 클래스 추가
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
          transition: 'none',
          '&:hover': {
            transform: 'none',
            boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ position: 'relative', mr: { md: 4 } }}>
          <Avatar
            sx={{
              width: 140,
              height: 140,
              fontSize: 90,
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
              border: `4px solid ${cardBgColor}`,
              background: gradientColor,
              transition: 'none',
              '&:hover': {
                transform: 'none',
                boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            <AccountCircle fontSize="inherit" />
          </Avatar>
          <Tooltip title={`레벨 ${user.level}`} arrow>
            <Chip
              icon={<Star sx={{ color: '#fff' }} />}
              label={`Lv.${user.level}`}
              size="large"
              sx={{
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                px: 2,
                border: `2px solid ${cardBgColor}`,
                boxShadow: '0 0 10px 2px rgba(255, 193, 7, 0.7)',
                transition: 'none',
                '&:hover': {
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 10px 2px rgba(255, 193, 7, 0.7)',
                },
                animation: 'none',
              }}
            />
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: primaryColor }}>
            {user.name}
            <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
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
            transition: 'transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s ease, opacity 0.28s',
            '&:hover': {
              background: gradientColor,
              transform: 'scale(1.05)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
            },
            '&:active': {
              transform: 'scale(0.99)',
            },
          }}
          onClick={handleOpen}
        >
          프로필 수정
        </Button>
      </Paper>

      {/* 수정 모달 */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>프로필 수정</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              mt: 1,
            }}
            noValidate
            autoComplete="off"
          >
            <TextField label="이름" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField label="닉네임" name="nickname" value={form.nickname} onChange={handleChange} fullWidth />
            <TextField label="전화번호" name="phone" value={form.phone} onChange={handleChange} fullWidth />
            <TextField label="주소" name="address" value={form.address} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            취소
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfileCard;
