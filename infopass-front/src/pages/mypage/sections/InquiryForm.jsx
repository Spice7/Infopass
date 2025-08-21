import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, CircularProgress, Snackbar, Alert } from '@mui/material';
import Cookies from 'js-cookie';
import { submitInquiry } from '@/user/inquiry.js'; // 실제 API 모듈 사용

const InquiryForm = () => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const token = Cookies.get('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setMessage({ open: true, text: '로그인이 필요합니다.', severity: 'warning' });
      return;
    }

    if (!category || !title || !content) {
      setMessage({ open: true, text: '모든 필드를 입력해주세요.', severity: 'warning' });
      return;
    }

    setLoading(true);

    const inquiryData = { category, title, content };

    try {
      await submitInquiry(inquiryData); // 실제 API 호출
      setMessage({ open: true, text: '문의가 성공적으로 제출되었습니다!', severity: 'success' });

      // 폼 초기화
      setCategory('');
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      setMessage({ open: true, text: `문의 제출 실패: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setMessage({ ...message, open: false });
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="error">
          로그인이 필요합니다.
        </Typography>
        <Typography sx={{ mt: 1 }}>
          문의를 제출하려면 로그인해주세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 700,
        mx: 'auto',
        my: 4,
        p: { xs: 3, md: 5 },
        borderRadius: 2,
        bgcolor: '#1c1c2c',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4, color: '#ffffff' }}>
        📩 문의하기
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          select
          label="문의 유형"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          InputLabelProps={{ sx: { color: '#ffffff' } }}
          InputProps={{ sx: { fontSize: '1.1rem', height: '3.5rem', color: '#ffffff' } }}
          variant="outlined"
          sx={{
            backgroundColor: '#2c2c3c',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
            '& .MuiSelect-icon': { color: '#ffffff' },
          }}
          SelectProps={{
            MenuProps: {
              PaperProps: { sx: { bgcolor: '#2c2c3c', color: '#ffffff' } },
            },
          }}
        >
          <MenuItem value="quiz">퀴즈 오류</MenuItem>
          <MenuItem value="account">계정 문제</MenuItem>
          <MenuItem value="other">기타</MenuItem>
        </TextField>

        <TextField
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          InputLabelProps={{ sx: { color: '#ffffff' } }}
          InputProps={{ sx: { fontSize: '1.1rem', height: '3.5rem', color: '#ffffff' } }}
          variant="outlined"
          sx={{
            backgroundColor: '#2c2c3c',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
          }}
        />

        <TextField
          label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={8}
          required
          InputLabelProps={{ sx: { color: '#ffffff' } }}
          InputProps={{ sx: { fontSize: '1.1rem', color: '#ffffff' } }}
          variant="outlined"
          sx={{
            backgroundColor: '#2c2c3c',
            borderRadius: 1,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            py: 1.5,
            fontSize: '1rem',
            borderRadius: 2,
            alignSelf: 'flex-end',
            background: 'linear-gradient(45deg, #7c4dff 30%, #4a148c 90%)',
            color: '#ffffff',
            boxShadow: '0 3px 10px 2px rgba(124, 77, 255, .3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 15px 4px rgba(124, 77, 255, .4)',
              background: 'linear-gradient(45deg, #4a148c 30%, #7c4dff 90%)',
            },
            '&:active': { transform: 'translateY(0)', boxShadow: '0 2px 5px 1px rgba(124, 77, 255, .2)' },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '제출'}
        </Button>
      </Box>

      <Snackbar open={message.open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InquiryForm;
