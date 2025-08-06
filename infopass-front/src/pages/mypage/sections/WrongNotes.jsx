// sections/WrongNotes.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, Paper, CircularProgress } from '@mui/material';

const WrongNotes = () => {
  const [wrongAnswers, setWrongAnswers] = useState(null);

  useEffect(() => {
    // 더미 데이터 로딩 모사
    setTimeout(() => {
      setWrongAnswers([
        {
          id: 1,
          game_type: 'quiz',
          question: 'React의 상태관리는 무엇인가요?',
          correct_answer: '컴포넌트 상태 저장',
          submitted_answer: '컴포넌트 렌더링',
          created_at: '2025-08-01',
        },
        {
          id: 2,
          game_type: 'oxquiz',
          question: 'HTML은 프로그래밍 언어이다.',
          correct_answer: 'X',
          submitted_answer: 'O',
          created_at: '2025-08-03',
        },
      ]);
    }, 500);
  }, []);

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
      <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        📚 오답노트
      </Typography>
      <List>
        {wrongAnswers.map(({ id, game_type, question, correct_answer, submitted_answer, created_at }) => (
          <Paper key={id} elevation={3} sx={{ mb: 2, p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              [{game_type.toUpperCase()}] {created_at}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Q. {question}
            </Typography>
            <Typography variant="body2" color="error.main">
              내 답변: {submitted_answer}
            </Typography>
            <Typography variant="body2" color="success.main">
              정답: {correct_answer}
            </Typography>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default WrongNotes;
