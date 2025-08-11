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
import Cookies from 'js-cookie';

import { update } from '../../../../user/auth';

const primaryColor = '#4a90e2';
const gradientColor = 'linear-gradient(135deg, #4a90e2 0%, #81d4fa 100%)';
const cardBgColor = '#ffffff';

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

const formatInputPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7) {
    return cleaned.replace(/(\d{3})(\d+)/, '$1-$2');
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{0,4})/, (_, a, b, c) =>
    c ? `${a}-${b}-${c}` : `${a}-${b}`
  );
};

const UserProfileCard = ({ user, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    setError(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm((prev) => ({
        ...prev,
        [name]: formatInputPhoneNumber(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedData = {
        ...form,
        enabled: user.enabled,
      };
      const response = await update(user.id, updatedData);
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

  const handleDeleteConfirm = () => setDeleteOpen(true);
  const handleDeleteCancel = () => setDeleteOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedData = {
        ...form,
        enabled: 0,
      };
      const res = await update(user.id, updatedData);
      if (res.status === 200) {
        alert('회원탈퇴가 완료되었습니다.');

        Cookies.remove('accessToken');
        localStorage.removeItem('accessToken');

        window.location.href = '/';
      } else {
        alert('회원탈퇴 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setDeleteOpen(false);
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
        <Box sx={{ position: 'relative', mr: { md: 4 } }}>
          <Avatar
            sx={{
              width: 140,
              height: 140,
              fontSize: 90,
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
              border: `4px solid ${cardBgColor}`,
              background: gradientColor,
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
              }}
            />
          </Tooltip>
        </Box>

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
            <b>전화번호:</b> {formatPhoneNumber(user.phone)}
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
          }}
          onClick={handleOpen}
        >
          프로필 수정
        </Button>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: 24,
            color: primaryColor,
            pb: 1,
            mb: 2,
            textAlign: 'center',
          }}
        >
          프로필 수정
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            bgcolor: '#f9fafe',
            borderRadius: '0 0 8px 8px',
            p: 3,
            pt: 2,
          }}
        >
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 260,
            }}
            noValidate
            autoComplete="off"
          >
            {['name', 'nickname', 'phone', 'address'].map((field) => (
              <TextField
                key={field}
                label={
                  field === 'name'
                    ? '이름'
                    : field === 'nickname'
                    ? '닉네임'
                    : field === 'phone'
                    ? '전화번호'
                    : '주소'
                }
                name={field}
                value={form[field]}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="medium"
                sx={{
                  maxWidth: 400,
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 14px rgb(0 0 0 / 0.15)',
                    },
                  },
                }}
              />
            ))}
            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, fontWeight: 600, textAlign: 'center' }}
              >
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>

        {/* 버튼 영역 */}
        <DialogActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',   // 위아래 중앙 정렬
            justifyContent: 'space-between',
            px: 3,
            py: 3, // 위아래 패딩 여유 있게
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={loading}
            sx={{
              fontWeight: 600,
              px: 2.5,
              py: 1, // 패딩 조금 키움
              border: `1px solid ${primaryColor}`,
              borderRadius: 2,
              color: primaryColor,
              textTransform: 'none',
              fontSize: '0.85rem',
              transition: 'background-color 0.3s ease',
              ':hover': { bgcolor: `${primaryColor}22` },
            }}
          >
            취소
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleDeleteConfirm}
              disabled={loading}
              sx={{
                bgcolor: 'black',
                color: 'white',
                fontWeight: 600,
                px: 2.5,
                py: 1, // 패딩 조금 키움
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.85rem',
                transition: 'background-color 0.3s ease',
                ':hover': { bgcolor: '#222' },
              }}
            >
              회원 탈퇴
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              sx={{
                fontWeight: 600,
                px: 2.5,
                py: 1, // 패딩 조금 키움
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.85rem',
                border: `1px solid ${primaryColor}`,
                color: primaryColor,
                transition: 'background-color 0.3s ease',
                ':hover': { bgcolor: `${primaryColor}22` },
              }}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          회원 탈퇴 확인
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" sx={{ mb: 2 }}>
            정말 탈퇴하시겠습니까? 이 작업은 언제든 복구 가능합니다.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 3,
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleDeleteCancel}
            color="inherit"
            sx={{
              fontWeight: 600,
              px: 2.5,
              py: 1,
              border: `1px solid ${primaryColor}`,
              borderRadius: 2,
              color: primaryColor,
              textTransform: 'none',
              fontSize: '0.85rem',
              transition: 'background-color 0.3s ease',
              ':hover': { bgcolor: `${primaryColor}22` },
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            sx={{
              bgcolor: 'black',
              color: 'white',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.85rem',
              ':hover': {
                bgcolor: '#222',
              },
            }}
          >
            탈퇴
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfileCard;
