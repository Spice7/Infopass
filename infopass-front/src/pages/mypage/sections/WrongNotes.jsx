// sections/WrongNotes.jsx
import React, { useEffect, useState } from 'react';
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

const gameTypes = ['quiz', 'oxquiz', 'block', 'card'];

const WrongNotes = () => {
  const theme = useTheme();
  const [wrongAnswers, setWrongAnswers] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState('quiz');

  useEffect(() => {
    setTimeout(() => {
      setWrongAnswers([
        {
          id: 1,
          question_id: 101,
          game_type: 'quiz',
          question: 'React의 상태관리는 무엇인가요?',
          correct_answer: '컴포넌트 상태 저장',
          submitted_answer: '컴포넌트 렌더링',
          explanation_snapshot:
            'React에서는 컴포넌트의 상태를 useState, useReducer 같은 Hook으로 관리합니다. 상태 관리가 잘 되어야 컴포넌트가 올바르게 렌더링됩니다.',
          created_at: '2025-08-01',
        },
        {
          id: 4,
          question_id: 101,
          game_type: 'quiz',
          question: 'React의 상태관리는 무엇인가요?',
          correct_answer: '컴포넌트 상태 저장',
          submitted_answer: '컴포넌트 렌더링',
          explanation_snapshot:
            'React에서는 컴포넌트의 상태를 useState, useReducer 같은 Hook으로 관리합니다. 상태 관리가 잘 되어야 컴포넌트가 올바르게 렌더링됩니다.',
          created_at: '2025-08-07',
        },
        {
          id: 2,
          question_id: 201,
          game_type: 'oxquiz',
          question: 'HTML은 프로그래밍 언어이다.',
          correct_answer: 'X',
          submitted_answer: 'O',
          explanation_snapshot: 'HTML은 마크업 언어이며 프로그래밍 언어가 아닙니다.',
          created_at: '2025-08-03',
        },
        {
          id: 3,
          question_id: 301,
          game_type: 'block',
          question:
            '자바스크립트에서 클로저(Closure)의 개념을 설명하고, 이를 활용하는 실제 사례를 자세히 기술하시오. 클로저가 발생하는 원리와 메모리 관리 측면에서의 장단점도 포함해주세요.',
          correct_answer:
            '클로저란 함수가 선언될 당시의 스코프를 기억하는 함수로, 외부 함수의 변수에 접근할 수 있습니다. 이를 통해 데이터 은닉, 함수 팩토리 등을 구현할 수 있습니다. 단점으로는 과도한 메모리 점유 가능성이 있습니다.',
          submitted_answer:
            '클로저는 함수 내부에서 변수에 접근하는 것이라고 알고 있습니다. 주로 함수 안에 함수가 있는 구조입니다.',
          explanation_snapshot:
            '클로저는 함수와 그 함수가 선언될 당시의 렉시컬 환경(Lexical Environment)을 함께 기억하는 구조입니다. 클로저를 이용하면 외부 함수의 지역변수를 은닉하고, 상태를 유지할 수 있어 모듈화에 유용합니다. 하지만 클로저가 참조하는 변수들이 메모리에 계속 남아있어 메모리 누수가 발생할 위험이 있습니다.',
          created_at: '2025-08-05',
        },
      ]);
    }, 500);
  }, []);

  const processWrongAnswers = (answers) => {
    if (!answers) return [];
    const map = new Map();
    answers.forEach((item) => {
      const key = item.game_type + '-' + item.question_id;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.count += 1;
        if (new Date(item.created_at) > new Date(existing.created_at)) {
          map.set(key, { ...item, count: existing.count });
        } else {
          map.set(key, existing);
        }
      } else {
        map.set(key, { ...item, count: 1 });
      }
    });
    return Array.from(map.values());
  };

  const filteredWrongAnswers = processWrongAnswers(wrongAnswers).filter(
    (item) => item.game_type === selectedGameType
  );

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  if (!wrongAnswers)
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  if (wrongAnswers.length === 0)
    return (
      <Typography variant="h6" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
        틀린 문제가 없습니다!
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 700, width: '100%' }}>
      {/* Tabs만 남기고 오답노트 글자는 삭제 */}

      {/* 스타일링 개선된 탭 */}
      <Tabs
        value={selectedGameType}
        onChange={(e, newVal) => setSelectedGameType(newVal)}
        centered
        sx={{
          mb: 3,
          '.MuiTabs-flexContainer': {
            gap: 2,
          },
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
          indicator: {
            display: 'none',
          },
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

        {filteredWrongAnswers.map(
          ({
            id,
            game_type,
            question,
            submitted_answer,
            created_at,
            count,
          }) => (
            <Paper
              key={id}
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
              onClick={() =>
                handleOpenDialog(filteredWrongAnswers.find((item) => item.id === id))
              }
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                [{game_type.toUpperCase()}] {created_at}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Q. {question}
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                내 답변: {submitted_answer}
              </Typography>
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ mt: 1, fontWeight: 'bold' }}
              >
                {count}회 틀림
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
          )
        )}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>오답 상세 보기</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                [{selectedItem.game_type.toUpperCase()}] {selectedItem.created_at}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                Q. {selectedItem.question}
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                내 답변: {selectedItem.submitted_answer}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                정답: {selectedItem.correct_answer}
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
