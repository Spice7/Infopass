import React, { useState } from 'react';
import {
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  useTheme,
  Box,
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// 분리된 커스텀 훅과 컴포넌트 가져오기
import useWrongNotesData from './useWrongNotesData';
import WrongNotesList from './WrongNotesList';
import WrongNotesDialog from './WrongNotesDialog';

const gameTypes = ['all', 'quiz', 'oxquiz', 'block', 'card'];

const WrongNotes = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 커스텀 훅을 사용하여 상태와 데이터를 가져옴
  const { isLoading, wrongAnswers, filteredWrongAnswers, selectedGameType, setSelectedGameType, formatAnswers, convertOX } = useWrongNotesData();

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" color="#fff" sx={{ mt: 2 }}>
          오답노트를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, p: 3 }}>
        <QuestionAnswerIcon sx={{ fontSize: 80, color: '#fff' }} />
        <Typography variant="h5" color="#fff" sx={{ mt: 3 }}>
          아직 틀린 문제가 없네요! 🎉
        </Typography>
        <Typography variant="body1" color="#fff" sx={{ mt: 1 }}>
          문제를 풀고 오답이 생기면 여기에 표시됩니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 1, px: 2 }}>
      <Tabs
        value={selectedGameType}
        onChange={(e, newVal) => setSelectedGameType(newVal)}
        centered
        indicatorColor="none"
        sx={{
          mb: 3,
          '.MuiTabs-flexContainer': { gap: 2, flexWrap: 'wrap' },
          '.MuiTabs-indicator': { display: 'none !important' },
          '.MuiTab-root': {
            outline: 'none',
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'none',
            borderRadius: 3,
            padding: '10px 24px',
            transition: 'all 0.3s',
            color: theme.palette.grey[600],
            backgroundColor: theme.palette.grey[200],
            '&:hover': { color: '#fff', backgroundColor: 'rgba(46, 46, 78, 0.8)' },
            '&.Mui-selected': {
              backgroundColor: 'rgba(46, 46, 78, 0.8)',
              color: '#fff',
              boxShadow: '0 6px 15px rgb(0 0 0 / 0.2)',
            },
          },
        }}
      >
        {gameTypes.map((type) => (
          <Tab key={type} label={type === 'all' ? '전체' : type.toUpperCase()} value={type} />
        ))}
      </Tabs>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 10,
            background: 'rgba(30,34,64,0.7)',
            borderRadius: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #8e44ad 30%, #232946 100%)',
            borderRadius: 8,
            minHeight: 40,
            border: '2px solid #232946',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #a55eea 0%, #232946 100%)',
          },
          scrollbarColor: '#8e44ad #232946',
          scrollbarWidth: 'thin',
        }}
      >
        <WrongNotesList
          filteredWrongAnswers={filteredWrongAnswers}
          handleOpenDialog={handleOpenDialog}
          formatAnswers={formatAnswers}
          selectedGameType={selectedGameType}
        />
      </Box>

      <WrongNotesDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        selectedItem={selectedItem}
        formatAnswers={formatAnswers}
        convertOX={convertOX}
      />
    </Box>
  );
};

export default WrongNotes;