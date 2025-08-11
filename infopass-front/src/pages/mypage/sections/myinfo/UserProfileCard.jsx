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

import { update } from '../../../../user/auth';  // update 함수 임포트

import './UserProfileCard.css';

const primaryColor = '#4a90e2';
const gradientColor = 'linear-gradient(135deg, #4a90e2 0%, #81d4fa 100%)';
const cardBgColor = '#ffffff';

// 보기용 전화번호 포맷 함수
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

// 입력폼용 전화번호 자동 하이픈 함수
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
  // 프로필 수정 모달 열림 상태
  const [open, setOpen] = useState(false);
  // 회원탈퇴 확인 모달 상태
  const [deleteOpen, setDeleteOpen] = useState(false);
  // 프로필 수정 폼 상태
  const [form, setForm] = useState({
    name: user.name ?? '',
    nickname: user.nickname ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
  });
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 프로필 수정 모달 열기 (기존 유저정보로 초기화)
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

  // 폼 입력 변경 처리
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

  // 프로필 수정 저장
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // 기존 user.enabled를 포함해서 보냄
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

  // 회원탈퇴 확인 모달 열기/닫기
  const handleDeleteConfirm = () => setDeleteOpen(true);
  const handleDeleteCancel = () => setDeleteOpen(false);

  // 회원탈퇴 실행 (enabled = 0으로 업데이트)
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

        Cookies.remove('accessToken');  // 쿠키명에 맞게 변경
        localStorage.removeItem('accessToken');

        window.location.href = '/';  // 메인 페이지로 이동
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
        {/* 아바타 + 레벨 */}
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

        {/* 유저 정보 */}
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

        {/* 수정 버튼 */}
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

      {/* 프로필 수정 모달 */}
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
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            취소
          </Button>
          <Box>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              회원 탈퇴
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* 회원탈퇴 확인 모달 */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle>회원 탈퇴 확인</DialogTitle>
        <DialogContent>
          <Typography>정말 탈퇴하시겠습니까? 이 작업은 언제든 복구 가능합니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            탈퇴
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserProfileCard;
