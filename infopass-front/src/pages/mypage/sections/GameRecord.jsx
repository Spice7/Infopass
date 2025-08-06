// sections/GameRecord.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';

const brandColor = '#1976d2';

const GameRecord = () => {
  const [gameRecords, setGameRecords] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setGameRecords({
        quiz: { play_count: 50, correct_ratio: 0.85, last_played: '2025-08-03' },
        oxquiz: { play_count: 30, correct_ratio: 0.9, last_played: '2025-08-02' },
        block: { play_count: 20, correct_ratio: 0.8, last_played: '2025-07-31' },
        card: { play_count: 15, correct_ratio: 0.75, last_played: '2025-07-30' },
        multiplayer: { total_score: 8420, best_score: 2000, average_score: 1500 },
      });
    }, 500);
  }, []);

  if (!gameRecords)
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 900, width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🎮 게임 기록
      </Typography>
      <Grid container spacing={3}>
        {['quiz', 'oxquiz', 'block', 'card'].map((game) => (
          <Grid item xs={12} sm={6} md={3} key={game}>
            <Card elevation={5} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color={brandColor}
                  sx={{ textTransform: 'uppercase', mb: 1, textAlign: 'center' }}
                >
                  {game}
                </Typography>
                <Typography>플레이 횟수: {gameRecords[game].play_count}</Typography>
                <Typography>정답률: {(gameRecords[game].correct_ratio * 100).toFixed(1)}%</Typography>
                <Typography>최근 플레이: {gameRecords[game].last_played}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Card elevation={5} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" color={brandColor} sx={{ mb: 1, textAlign: 'center' }}>
                멀티플레이어 기록
              </Typography>
              <Typography>총 점수: {gameRecords.multiplayer.total_score}</Typography>
              <Typography>최고 점수: {gameRecords.multiplayer.best_score}</Typography>
              <Typography>평균 점수: {gameRecords.multiplayer.average_score.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameRecord;
