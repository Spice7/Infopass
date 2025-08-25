import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReactMarkdown from 'react-markdown';
import BlockXmlPreview from '@/games/block/components/BlockXmlPreview.jsx';

const WrongNotesDialog = ({ open, handleClose, selectedItem, formatAnswers, convertOX }) => {
  if (!selectedItem) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
        <LightbulbIcon color="primary" sx={{ mr: 1 }} /> 오답 상세 보기
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          [{selectedItem.gameType?.toUpperCase()}] {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          카테고리: <span style={{ fontWeight: 'bold' }}>{selectedItem.category || '없음'}</span>
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Q. {selectedItem.question}
        </Typography>
        {selectedItem.gameType === 'block' ? (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CancelIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body1" color="error.main" sx={{ fontWeight: 600 }}>
                내 답변 (제출 블록)
              </Typography>
            </Box>
            <BlockXmlPreview xml={selectedItem.submittedAnswer} height={220} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CancelIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="body1" color="error.main">
              내 답변: <span style={{ fontWeight: 600 }}>{formatAnswers(selectedItem.answers)}</span>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="body1" color="success.main">
            정답:
          </Typography>
          {selectedItem.gameType === 'block' && selectedItem.explanationImage ? (
            <img
              src={selectedItem.explanationImage}
              alt="블록게임 정답 이미지"
              style={{ maxHeight: '10%', marginLeft: '2%' }}
            />
          ) : (
            <Typography variant="body1" color="success.main">
              <span style={{ fontWeight: 600, ml: 1 }}>{convertOX(selectedItem.correctAnswer)}</span>
            </Typography>
          )}
        </Box>

        {selectedItem.gameType === 'block' ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              해설:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <ReactMarkdown>{selectedItem.explanation || ''}</ReactMarkdown>
            </Paper>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 2 }}>
            <strong>해설:</strong> {selectedItem.explanation}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WrongNotesDialog;