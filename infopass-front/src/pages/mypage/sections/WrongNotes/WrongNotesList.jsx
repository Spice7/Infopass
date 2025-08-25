import React from 'react';
import { Typography, List, Paper, Stack, Box, useTheme } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockXmlPreview from '@/games/block/components/BlockXmlPreview.jsx';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const WrongNotesList = ({ filteredWrongAnswers, handleOpenDialog, formatAnswers, selectedGameType }) => {
  const theme = useTheme();

  if (filteredWrongAnswers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
        <QuestionAnswerIcon sx={{ fontSize: 80, color: '#fff' }} />
        <Typography variant="h6" color="#fff" sx={{ mt: 3 }}>
          {selectedGameType === 'all'
            ? '틀린 문제가 없어요.'
            : `${selectedGameType.toUpperCase()} 타입의 틀린 문제가 없어요.`}
        </Typography>
        <Typography variant="body2" color="#fff" sx={{ mt: 1 }}>
          다른 탭을 확인하거나 문제를 풀어보세요!
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {filteredWrongAnswers.map((item) => (
        <Paper
          key={`${item.gameType}-${item.questionId}`}
          elevation={4}
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
          }}
          onClick={() => handleOpenDialog(item)}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="subtitle2" color="text.secondary">
              [{item.gameType.toUpperCase()}] {item.createdAt ? new Date(item.createdAt).toLocaleString() : '날짜 정보 없음'}
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
              }}
            >
              {item.count}회 오답
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
            Q. {item.question}
          </Typography>
          {item.gameType === 'block' ? (
            <Box sx={{ mt: 2 }}>
              <CancelIcon color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
              <Typography variant="body1" color="error.main" display="inline" sx={{ mr: 2 }}>
                내 답변:
              </Typography>
              <BlockXmlPreview xml={item.submittedAnswer} height={140} />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <CancelIcon color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
              <Typography variant="body1" color="error.main" display="inline">
                내 답변: <span style={{ fontWeight: 600 }}>{formatAnswers(item.answers)}</span>
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: 2,
              color: theme.palette.primary.main,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              정답과 해설 보기
            </Typography>
            <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 1 }} />
          </Box>
        </Paper>
      ))}
    </List>
  );
};

export default WrongNotesList;