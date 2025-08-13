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
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const GameResultList = () => {
  const theme = useTheme();
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState('all');

  // 더미 데이터 (UI 확인용)
  useEffect(() => {
    setTimeout(() => {
      setResults([
        { id: 1, lobby_id: 101, user_id: 10, score: 1500, user_rank: 3, rank_change: 25, game_type: 'oxquiz', created_at: '2025-08-10 15:20:00' },
        { id: 2, lobby_id: 102, user_id: 10, score: 1800, user_rank: 1, rank_change: 50, game_type: 'quiz', created_at: '2025-08-09 13:10:00' },
        { id: 3, lobby_id: 103, user_id: 10, score: 1200, user_rank: 5, rank_change: -10, game_type: 'block', created_at: '2025-08-08 19:05:00' },
        { id: 4, lobby_id: 104, user_id: 10, score: 2100, user_rank: 2, rank_change: 0, game_type: 'quiz', created_at: '2025-08-07 10:00:00' },
      ]);
    }, 500);
  }, []);

  const gameIcons = {
    oxquiz: <QuizIcon sx={{ color: '#4caf50' }} />,
    quiz: <SportsScoreIcon sx={{ color: '#2196f3' }} />,
    block: <ViewModuleIcon sx={{ color: '#ff9800' }} />,
    card: <ViewModuleIcon sx={{ color: '#9c27b0' }} />, // CARD 아이콘
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('ko-KR', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

  const getRankChangeInfo = (change) => {
    if (change > 0) return { label: `+${change} P`, color: 'success', icon: <ArrowUpwardIcon fontSize="small" /> };
    if (change < 0) return { label: `${change} P`, color: 'error', icon: <ArrowDownwardIcon fontSize="small" /> };
    return { label: '0 P', color: 'info', icon: <HorizontalRuleIcon fontSize="small" /> };
  };

  const getRankEmoji = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank);

  const filteredResults = !results 
    ? [] 
    : filter === 'all' 
      ? results 
      : results.filter(r => r.game_type === filter);

  if (!results) return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <CircularProgress color="primary" size={60} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt:1, px:2 }}>
      {/* 오답노트 스타일 탭 적용 */}
      <Tabs
        value={filter}
        onChange={(e, v) => setFilter(v)}
        centered
        indicatorColor="none"
        sx={{
          mb: 3,
          '.MuiTabs-flexContainer': { gap: 2, flexWrap: 'wrap' },
          '.MuiTabs-indicator': { display: 'none !important' },
          '.MuiTab-root': {
            fontWeight: 700,
            fontSize: 16,
            textTransform: 'none',
            borderRadius: 3,
            padding: '10px 24px',
            transition: 'all 0.3s',
            color: theme.palette.grey[600],
            backgroundColor: theme.palette.grey[200],
            boxShadow: 'none',
            border: 'none',
            outline: 'none',
            '&:focus-visible': { outline: 'none' },
            '&:hover': { backgroundColor: theme.palette.grey[400] },
            '&:active': { backgroundColor: theme.palette.grey[500] },
            '&.Mui-selected': {
              backgroundColor: theme.palette.grey[400],
              color: '#fff',
              boxShadow: '0 6px 15px rgb(0 0 0 / 0.2)',
              transform: 'translateY(-2px)',
            },
          },
        }}
      >
        <Tab value="all" label="전체" />
        <Tab value="quiz" label="QUIZ" />
        <Tab value="oxquiz" label="OXQUIZE" />
        <Tab value="block" label="BLOCK" />
        <Tab value="card" label="CARD" /> {/* 카드 탭 추가 */}
      </Tabs>

      {/* 리스트 */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, WebkitOverflowScrolling: 'touch', maxHeight: { xs: '60vh', md: 'calc(100vh - 240px)' } }}>
        {filteredResults.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, p: 3 }}>
            <QuestionAnswerIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }} />
            <Typography variant="h5" color="text.secondary" sx={{ mt: 3 }}>
              선택한 탭의 게임 기록이 없습니다.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              다른 탭을 확인하거나 게임을 플레이 해보세요!
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredResults.map(({ id, score, user_rank, rank_change, game_type, created_at }) => {
              const rankChangeInfo = getRankChangeInfo(rank_change);
              return (
                <React.Fragment key={id}>
                  <ListItem
                    sx={{
                      mb:2,
                      bgcolor:'#fff',
                      borderRadius:3,
                      boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
                      px:3, py:2,
                      '&:hover': { boxShadow:'0 8px 25px rgba(0,0,0,0.15)', transform:'translateY(-2px)', transition:'all 0.3s' },
                      display:'flex', flexDirection:'column', gap:1,
                      cursor:'pointer'
                    }}
                  >
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        {gameIcons[game_type] || <QuizIcon />}
                        <Typography variant="h6" sx={{ fontWeight:'700', textTransform:'capitalize', color:'#1976d2' }}>{game_type}</Typography>
                      </Box>
                      <Chip label={rankChangeInfo.label} color={rankChangeInfo.color} icon={rankChangeInfo.icon} size="small" sx={{ fontWeight:'bold' }} />
                    </Box>

                    <Divider sx={{ my:1, width:'100%' }} />

                    <Box sx={{ display:'flex', justifyContent:'space-between', width:'100%', flexWrap:'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight:'600' }}>
                        점수: <span style={{ color:'#d32f2f' }}>{score.toLocaleString()}</span>
                      </Typography>

                      {/* oxquiz 승리/패배 표시 */}
                      {game_type === 'oxquiz' ? (
                        <Typography variant="subtitle1" sx={{ fontWeight:'600', color: user_rank === 1 ? '#4caf50' : '#f44336' }}>
                          {user_rank === 1 ? '승리' : '패배'}
                        </Typography>
                      ) : (
                        <Typography variant="subtitle1" sx={{ fontWeight:'600', color:'#f57c00' }}>
                          순위: {getRankEmoji(user_rank)}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ alignSelf:'flex-start', mt:1 }}>
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
