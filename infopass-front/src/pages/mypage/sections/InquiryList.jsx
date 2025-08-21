import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, List } from '@mui/material';

const InquiryList = () => {
  const [inquiries, setInquiries] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setInquiries([
        { id: 1, question: 'OX퀴즈 오류 있어요', status: '답변 완료', date: '2025-08-01' },
        { id: 2, question: '게임 기록 초기화 방법?', status: '처리 중', date: '2025-08-02' },
      ]);
    }, 500);
  }, []);

  if (!inquiries) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 6 }}>
        문의 내역이 없습니다.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, width: '100%', mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        📩 문의 내역
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {inquiries.map(({ id, question, status, date }) => (
          <Paper key={id} elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={600}>
              {question}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {date}
            </Typography>
            <Typography
              variant="body2"
              color={status === '답변 완료' ? 'success.main' : 'warning.main'}
              fontWeight={700}
            >
              상태: {status}
            </Typography>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default InquiryList;
