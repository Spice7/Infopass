import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
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
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { getWrongAnswers } from '../../../user/auth';

// 탭에 사용할 게임 타입 목록
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

  // DB에서 오답 데이터를 가져오는 함수
  const fetchWrongNotes = async () => {
    try {
      const response = await getWrongAnswers();
      const data = response.data;
      
      // API 응답 데이터 확인 (디버깅용)
      console.log("API 응답 데이터:", data); 

      setWrongAnswers(data);

      if (data && data.length > 0) {
        // 데이터에 존재하는 첫 번째 유효한 게임 타입을 찾아 기본 탭으로 설정
        // `gameType`을 소문자로 통일하여 처리
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

  // API 데이터 가공 및 필터링 로직 (useMemo로 성능 최적화)
  const processedAnswers = useMemo(() => {
    if (!wrongAnswers || wrongAnswers.length === 0) return [];

    const map = new Map();

    wrongAnswers.forEach((item) => {
      // ✅ item에 필요한 속성이 있는지 안전하게 확인
      if (item && item.gameType && item.questionId) {
        // 대소문자를 통일하여 key 생성
        const key = `${item.gameType.toLowerCase()}-${item.questionId}`;
        const currentCreatedAt = item.createdAt ? new Date(item.createdAt) : new Date(0);

        if (map.has(key)) {
          const existing = map.get(key);
          existing.count += 1;
          const existingCreatedAt = existing.createdAt ? new Date(existing.createdAt) : new Date(0);

          // 최신 기록으로 덮어쓰고, count는 누적
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

  // 선택된 탭에 맞는 오답만 필터링
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

  // 로딩 중일 때
  if (wrongAnswers === null)
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  // 오답이 없을 때
  if (wrongAnswers.length === 0)
    return (
      <Typography variant="h6" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
        틀린 문제가 없습니다!
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 700, width: '100%' }}>
      <Tabs
        value={selectedGameType}
        onChange={(e, newVal) => setSelectedGameType(newVal)}
        centered
        sx={{
          mb: 3,
          '.MuiTabs-flexContainer': { gap: 2 },
          '.MuiTab-root': {
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'none',
            borderRadius: 3,
            padding: '8px 24px',
            transition: 'all 0.3s',
            color: theme.palette.grey[600],
            backgroundColor: theme.palette.grey[200],
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.1)',
            '&.Mui-selected': {
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              boxShadow: '0 4px 10px rgb(0 0 0 / 0.15)',
            },
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          },
          indicator: { display: 'none' },
        }}
      >
        {gameTypes.map((type) => (
          <Tab key={type} label={type.toUpperCase()} value={type} />
        ))}
      </Tabs>

      <List>
        {filteredWrongAnswers.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            해당 게임타입의 틀린 문제가 없습니다.
          </Typography>
        )}

        {filteredWrongAnswers.map((item) => (
          <Paper
            key={`${item.gameType}-${item.questionId}`}
            elevation={3}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              },
            }}
            onClick={() => handleOpenDialog(item)}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              [{item.gameType ? item.gameType.toUpperCase() : ''}] {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
             
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Q. {item.question}
            </Typography>
            <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
              내 답변: {item.submittedAnswer}
            </Typography>
            <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontWeight: 'bold' }}>
              {item.count}회 틀림
            </Typography>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{
                mt: 1,
                fontWeight: 'bold',
                textAlign: 'right',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              정답과 해설 보기 <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 0.5 }} />
            </Typography>
          </Paper>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>오답 상세 보기</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                [{selectedItem.gameType ? selectedItem.gameType.toUpperCase() : ''}] {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : ''}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                Q. {selectedItem.question}
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                내 답변: {selectedItem.submittedAnswer}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                정답: {selectedItem.correctAnswer}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                해설: {selectedItem.explanation_snapshot}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WrongNotes;