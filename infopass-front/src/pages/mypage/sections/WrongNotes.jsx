import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography,
  List,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  useTheme,
  Stack,
  Box,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { getWrongAnswers } from '../../../user/auth';

const gameTypes = ['quiz', 'oxquiz', 'block', 'card'];

const WrongNotes = () => {
  const theme = useTheme();
  const [wrongAnswers, setWrongAnswers] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState('quiz');

  useEffect(() => {
    fetchWrongNotes();
  }, []);

  const fetchWrongNotes = async () => {
    try {
      const response = await getWrongAnswers();
      const data = response.data;
      setWrongAnswers(data);

      if (data && data.length > 0) {
        const firstValidGameType = data.find(item => item.gameType)?.gameType;
        if (firstValidGameType) {
          setSelectedGameType(firstValidGameType.toLowerCase());
        }
      }
    } catch (error) {
      console.error('오답노트 요청 에러:', error);
      setWrongAnswers([]);
    }
  };

  const processedAnswers = useMemo(() => {
    if (!wrongAnswers || wrongAnswers.length === 0) return [];

    const map = new Map();

    wrongAnswers.forEach((item) => {
      if (item && item.gameType && item.questionId) {
        const key = `${item.gameType.toLowerCase()}-${item.questionId}`;
        const currentCreatedAt = item.createdAt ? new Date(item.createdAt) : new Date(0);

        if (map.has(key)) {
          const existing = map.get(key);
          existing.count += 1;
          const existingCreatedAt = existing.createdAt ? new Date(existing.createdAt) : new Date(0);

          if (currentCreatedAt > existingCreatedAt) {
            map.set(key, { ...item, count: existing.count });
          }
        } else {
          map.set(key, { ...item, count: 1 });
        }
      }
    });
    return Array.from(map.values());
  }, [wrongAnswers]);

  const filteredWrongAnswers = processedAnswers.filter(
    (item) => item.gameType && item.gameType.toLowerCase() === selectedGameType.toLowerCase()
  );

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  if (wrongAnswers === null) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          오답노트를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, p: 3 }}>
        <QuestionAnswerIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }} />
        <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
          아직 틀린 문제가 없네요! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          문제를 풀고 오답이 생기면 여기에 표시됩니다.
        </Typography>
      </Box>
    );
  }

  // 숫자 0/1을 O/X로 변환해주는 헬퍼 함수
  const convertOX = (val) => {
    if (val === 1 || val === '1') return 'O';
    if (val === 0 || val === '0') return 'X';
    return val;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // 부모에서 반드시 높이 지정 필요
        pt: 1, // 탭을 위로 조금 올림
        px: 2,
      }}
    >
      <Tabs
  value={selectedGameType}
  onChange={(e, newVal) => setSelectedGameType(newVal)}
  centered
  indicatorColor="none"
  sx={{
    mb: 3,
    backgroundColor: '#fff',         // 전체 배경 흰색
    borderRadius: 12,                // 둥근 테두리
    boxShadow: '0 0 0 1px #ddd',    // 연한 테두리
    '.MuiTabs-flexContainer': { gap: 2, flexWrap: 'wrap' },
    '.MuiTabs-indicator': {
      display: 'none !important',
    },
    '.MuiTab-root': {
      backgroundColor: '#fff',       // 각 탭 배경도 흰색
      borderRadius: 8,
      fontWeight: 700,
      fontSize: 16,
      textTransform: 'none',
      padding: '10px 24px',
      color: theme.palette.grey[600],
      boxShadow: 'none',
      border: 'none',
      outline: 'none',
      '&:focus-visible': {
        outline: 'none',
      },
      '&.Mui-selected, &:hover': {
        // 기존 스타일 유지 (색상 등 변경하지 않음)
        color: theme.palette.grey[600],
        backgroundColor: '#fff',
        boxShadow: 'none',
        transform: 'none',
        border: 'none',
        outline: 'none',
      },
    },
  }}
>

        {gameTypes.map((type) => (
          <Tab key={type} label={type.toUpperCase()} value={type} />
        ))}
      </Tabs>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto', // 탭 아래 스크롤 처리
          pr: 1,
        }}
      >
        <List>
          {filteredWrongAnswers.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
              <QuestionAnswerIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
                {selectedGameType.toUpperCase()} 타입의 틀린 문제가 없어요.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                다른 탭을 확인하거나 문제를 풀어보세요!
              </Typography>
            </Box>
          ) : (
            filteredWrongAnswers.map((item) => (
              <Paper
                key={`${item.gameType}-${item.questionId}`}
                elevation={4}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleOpenDialog(item)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    [{item.gameType.toUpperCase()}]{' '}
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : '날짜 정보 없음'}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      display: 'inline-block',
                      color: '#b35b00',
                      fontWeight: 'bold',
                      backgroundColor: '#fff4e5',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 12,
                      boxShadow: '0 1px 3px rgba(179, 91, 0, 0.3)',
                      userSelect: 'none',
                    }}
                  >
                    {item.count}회 오답
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                  Q. {item.question}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CancelIcon color="error" sx={{ mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="body1" color="error.main">
                    내 답변: <span style={{ fontWeight: 600 }}>{convertOX(item.submittedAnswer)}</span>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    mt: 2,
                    color: theme.palette.primary.main,
                    userSelect: 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    정답과 해설 보기
                  </Typography>
                  <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 1 }} />
                </Box>
              </Paper>
            ))
          )}
        </List>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
          <LightbulbIcon color="primary" sx={{ mr: 1 }} /> 오답 상세 보기
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                [{selectedItem.gameType ? selectedItem.gameType.toUpperCase() : ''}]{' '}
                {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                카테고리: <span style={{ fontWeight: 'bold' }}>{selectedItem.category || '없음'}</span>
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Q. {selectedItem.question}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CancelIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body1" color="error.main">
                  내 답변:{' '}
                  <span style={{ fontWeight: 600 }}>
                    {convertOX(selectedItem.submittedAnswer)}
                  </span>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body1" color="success.main">
                  정답:{' '}
                  <span style={{ fontWeight: 600 }}>
                    {convertOX(selectedItem.correctAnswer)}
                  </span>
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                <strong>해설:</strong> {selectedItem.explanation}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WrongNotes;
