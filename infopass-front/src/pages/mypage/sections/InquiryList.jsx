import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, CircularProgress, List, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab,
  ListItem, Chip, Divider, Stack
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { getMyInquiries } from '@/user/inquiry.js';

const InquiryList = () => {
  const [inquiries, setInquiries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [tab, setTab] = useState('전체');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await getMyInquiries();
        setInquiries(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('문의 내역 조회 실패', error);
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  // 날짜 표시 함수
  const getDisplayDate = ({ created_at, updated_at, response_date, status }) => {
    if (status === '답변 완료' && response_date) return new Date(response_date).toLocaleDateString();
    if (updated_at) return new Date(updated_at).toLocaleDateString();
    return new Date(created_at).toLocaleDateString();
  };

  if (loading) return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <CircularProgress color="primary" size={60} />
      <Typography variant="h6" color="#fff" sx={{ mt: 2 }}>문의 내역 불러오는 중...</Typography>
    </Box>
  );

  if (!inquiries || inquiries.length === 0) return (
    <Box sx={{ textAlign: 'center', mt: 10, p: 3 }}>
      <QuestionAnswerIcon sx={{ fontSize: 80, color: '#fff' }} />
      <Typography variant="h5" color="#fff" sx={{ mt: 3 }}>문의 내역이 없습니다! 🎉</Typography>
      <Typography variant="body1" color="#fff" sx={{ mt: 1 }}>문의하면 여기에 표시됩니다.</Typography>
    </Box>
  );

  const filteredInquiries = inquiries.filter(inq => tab === '전체' ? true : inq.status === tab);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2, px: 2 }}>
      {/* 탭 */}
      <Tabs
  value={tab}
  onChange={(e, newVal) => setTab(newVal)}
  centered
  indicatorColor="none"
  sx={{
    mb: 3,
    '.MuiTabs-flexContainer': { gap: 2, flexWrap: 'wrap' },
    '.MuiTab-root': {
      outline: 'none',
      fontWeight: 700,
      fontSize: 16,
      textTransform: 'none',
      borderRadius: 3,
      padding: '10px 24px',
      transition: 'all 0.3s',
      color: '#bbb', // 기본 글씨 연한 은하색
      backgroundColor: '#1c1c2c', // 기본 탭 배경 어두운 우주색
      '&:hover': { 
        color: '#fff', 
        backgroundColor: 'rgba(46,46,78,0.6)' 
      },
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, #8e44ad, #6a0dad)', // 선택된 탭 그라데이션
        color: '#fff', // 선택 글씨 흰색
        boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
      },
    },
  }}
>
  {['전체','접수','처리 중','답변 완료'].map((t) => <Tab key={t} label={t} value={t} />)}
</Tabs>



      {/* 카드 리스트 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': { width: 10, background: 'rgba(30,34,64,0.7)', borderRadius: 8 },
          '&::-webkit-scrollbar-thumb': { background: 'linear-gradient(135deg, #8e44ad 30%, #232946 100%)', borderRadius: 8, minHeight: 40, border: '2px solid #232946' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'linear-gradient(135deg, #a55eea 0%, #232946 100%)' },
          scrollbarColor: '#8e44ad #232946',
          scrollbarWidth: 'thin',
        }}
      >
        <List>
          {filteredInquiries.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
              <QuestionAnswerIcon sx={{ fontSize: 80, color: '#fff' }} />
              <Typography variant="h6" color="#fff" sx={{ mt: 3 }}>선택한 상태의 문의가 없습니다.</Typography>
            </Box>
          ) : filteredInquiries.map((inq, index) => (
            <React.Fragment key={inq.id}>
              <Paper
                onClick={() => setSelectedInquiry(inq)}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: '#2c2c3c',
                  '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
  <Chip 
    label={inq.category} 
    size="small" 
    color="primary" 
    variant="outlined" 
    sx={{ fontWeight: 'bold', color: '#fff', borderColor: '#fff' }} 
  />
  <Chip
    label={inq.status || '처리 중'}
    size="small"
    sx={{
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: (() => {
        switch (inq.status) {
          case '접수': return '#8e44ad';        // 보라색 네온
          case '처리 중': return '#3498db';      // 파랑 네온
          case '답변 완료': return '#2ecc71';    // 초록 네온
          default: return '#95a5a6';             // 회색
        }
      })(),
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 0 8px rgba(255,255,255,0.2)',
    }}
  />
</Stack>

                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>{inq.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#fff' }}>
                  {inq.status === '답변 완료' && inq.response_date
                    ? `답변일: ${new Date(inq.response_date).toLocaleDateString()}`
                    : `문의일: ${getDisplayDate(inq)}`
                  }
                </Typography>
              </Paper>
              {index < filteredInquiries.length - 1 && <Divider component="li" sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* 모달 */}
      {selectedInquiry && (
        <Dialog
          open={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          fullWidth maxWidth="sm"
          PaperProps={{ sx: { bgcolor: '#1c1c2c', color: '#fff', borderRadius: 4 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', bgcolor: '#2c2c3c' }}>
             {selectedInquiry.title}
            <Chip label={selectedInquiry.category} size="small" color="primary" variant="outlined" sx={{ ml: 1, color: '#fff', borderColor: '#fff' }} />
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <Typography variant="body2" sx={{ color: '#fff', opacity: 0.7 }}>문의 내용:</Typography>
            <Typography variant="body1" sx={{ mt: 1, color: '#fff' }}>{selectedInquiry.content}</Typography>
            {selectedInquiry.response_content && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.7 }}>답변:</Typography>
                <Paper sx={{ mt: 1, p: 2, backgroundColor: '#383848' }}>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedInquiry.response_content}</Typography>
                </Paper>
              </Box>
            )}
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#fff', opacity: 0.7 }}>
              {selectedInquiry.status === '답변 완료' && selectedInquiry.response_date
                ? `답변일: ${new Date(selectedInquiry.response_date).toLocaleDateString()}`
                : `문의일: ${getDisplayDate(selectedInquiry)}`
              }
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#2c2c3c' }}>
            <Button onClick={() => setSelectedInquiry(null)} sx={{ color: '#42a5f5' }}>닫기</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default InquiryList;
