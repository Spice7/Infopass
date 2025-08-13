import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

const GameResultList = () => {
  const theme = useTheme();
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState('all');

  // 더미 데이터 유지 (UI 확인용)
  useEffect(() => {
    setTimeout(() => {
      setResults([
        {
          id: 1,
          lobby_id: 101,
          user_id: 10,
          score: 1500,
          user_rank: 3,
          rank_change: 25,
          game_type: 'oxquize',
          created_at: '2025-08-10 15:20:00',
        },
        {
          id: 2,
          lobby_id: 102,
          user_id: 10,
          score: 1800,
          user_rank: 1,
          rank_change: 50,
          game_type: 'quiz',
          created_at: '2025-08-09 13:10:00',
        },
        {
          id: 3,
          lobby_id: 103,
          user_id: 10,
          score: 1200,
          user_rank: 5,
          rank_change: -10,
          game_type: 'block',
          created_at: '2025-08-08 19:05:00',
        },
        {
          id: 4,
          lobby_id: 104,
          user_id: 10,
          score: 2100,
          user_rank: 2,
          rank_change: 0,
          game_type: 'quiz',
          created_at: '2025-08-07 10:00:00',
        },
      ]);
    }, 500);
  }, []);

  const gameIcons = {
    oxquize: <QuizIcon sx={{ color: '#4caf50' }} />,
    quiz: <SportsScoreIcon sx={{ color: '#2196f3' }} />,
    block: <ViewModuleIcon sx={{ color: '#ff9800' }} />,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankChangeInfo = (change) => {
    if (change > 0) {
      return { label: `+${change} P`, color: 'success', icon: <ArrowUpwardIcon fontSize="small" /> };
    } else if (change < 0) {
      return { label: `${change} P`, color: 'error', icon: <ArrowDownwardIcon fontSize="small" /> };
    }
    return { label: `0 P`, color: 'info', icon: <HorizontalRuleIcon fontSize="small" /> };
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const filteredResults =
    !results
      ? []
      : filter === 'all'
      ? results
      : results.filter((r) => r.game_type === filter);

  if (!results) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        // 오답노트와 동일한 레이아웃 패턴
        display: 'flex',
        flexDirection: 'column',
        height: '100%',    // 부모에서 높이 지정 시 내부 스크롤 작동
        pt: 1,
        px: 2,
        // 오답노트처럼 가변 컨테이너(고정 maxWidth 제거)
      }}
    >
      {/* 오답노트와 동일 스타일의 Tabs */}
      <Tabs
        value={filter}
        onChange={(e, v) => setFilter(v)}
        centered
        indicatorColor="none"
        sx={{
          mb: 3,
          backgroundColor: '#fff',
          borderRadius: 12,
          boxShadow: '0 0 0 1px #ddd',
          '.MuiTabs-flexContainer': { gap: 2, flexWrap: 'wrap' },
          '.MuiTabs-indicator': {
            display: 'none !important',
          },
          '.MuiTab-root': {
            backgroundColor: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'none',
            padding: '10px 24px',
            color: theme.palette.grey[600],
            boxShadow: 'none',
            border: 'none',
            outline: 'none',
            '&:focus-visible': { outline: 'none' },
            '&.Mui-selected, &:hover': {
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
        <Tab value="all" label="전체" />
        <Tab value="quiz" label="QUIZ" />
        <Tab value="oxquize" label="OXQUIZE" />
        <Tab value="block" label="BLOCK" />
      </Tabs>

      {/* 리스트 영역: 오답노트와 동일하게 내부 스크롤 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          WebkitOverflowScrolling: 'touch',
          // 부모가 height를 안 줄 때도 스크롤 생기도록 보호막
          maxHeight: { xs: '60vh', md: 'calc(100vh - 240px)' },
        }}
      >
        {filteredResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            선택한 탭의 게임 기록이 없습니다.
          </Typography>
        ) : (
          <List>
            {filteredResults.map(({ id, score, user_rank, rank_change, game_type, created_at }) => {
              const rankChangeInfo = getRankChangeInfo(rank_change);
              return (
                <React.Fragment key={id}>
                  <ListItem
                    sx={{
                      mb: 2,
                      bgcolor: '#fff',
                      borderRadius: 3,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      px: 3,
                      py: 2,
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(25, 118, 210, 0.15)',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.25s ease',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {gameIcons[game_type] || <QuizIcon />}
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: '700', textTransform: 'capitalize', color: '#1976d2' }}
                        >
                          {game_type}
                        </Typography>
                      </Box>
                      <Chip
                        label={rankChangeInfo.label}
                        color={rankChangeInfo.color}
                        icon={rankChangeInfo.icon}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1, width: '100%' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                        점수: <span style={{ color: '#d32f2f' }}>{score.toLocaleString()}</span>
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#f57c00' }}>
                        순위: {getRankEmoji(user_rank)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      플레이 시간: {formatDate(created_at)}
                    </Typography>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default GameResultList;
