import React, { useEffect, useState, useMemo } from 'react';
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

import { getGameResults } from '../../../user/auth'; // API 함수

const GameResultList = () => {
  const theme = useTheme();
  const [results, setResults] = useState(null); // null → 로딩 상태
  const [filter, setFilter] = useState('all');

  // DB 데이터 가져오기
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getGameResults();
        // 백엔드(Java DTO)의 카멜 케이스 변수명에 맞게 데이터 처리
        setResults(response.data || []);
      } catch (error) {
        console.error('게임 결과 요청 에러:', error);
        setResults([]); // 에러 시 빈 배열
      }
    };
    fetchResults();
  }, []);

  const gameIcons = {
    oxquiz: <QuizIcon sx={{ color: '#4caf50' }} />,
    quiz: <SportsScoreIcon sx={{ color: '#2196f3' }} />,
    block: <ViewModuleIcon sx={{ color: '#ff9800' }} />,
    card: <ViewModuleIcon sx={{ color: '#9c27b0' }} />,
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getRankChangeInfo = (rankPoint) => {
    if (rankPoint > 0)
      return {
        label: `+${rankPoint} P`,
        color: 'success',
        icon: <ArrowUpwardIcon fontSize="small" />,
      };
    if (rankPoint < 0)
      return {
        label: `${rankPoint} P`,
        color: 'error',
        icon: <ArrowDownwardIcon fontSize="small" />,
      };
    return {
      label: '0 P',
      color: 'info',
      icon: <HorizontalRuleIcon fontSize="small" />,
    };
  };

  const getRankEmoji = (rank) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

  // DB 데이터 필터링
  const filteredResults = useMemo(() => {
    if (!results) return [];
    return filter === 'all'
      ? results
      : results.filter((r) => r.gameType === filter); // 'gameType'으로 수정
  }, [results, filter]);

  // 로딩 상태
  if (results === null)
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 1, px: 2 }}>
      {/* 필터 탭 */}
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
        <Tab value="oxquiz" label="OXQUIZ" />
        <Tab value="block" label="BLOCK" />
        <Tab value="card" label="CARD" />
      </Tabs>

      {/* 결과 목록 */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          WebkitOverflowScrolling: 'touch',
          maxHeight: { xs: '60vh', md: 'calc(100vh - 240px)' },
        }}
      >
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
            {filteredResults.map(
              // DTO의 카멜 케이스 변수명으로 구조 분해 할당
              ({ id, score, userRank, userRankPoint, gameType, createdAt }) => {
                const rankChangeInfo = getRankChangeInfo(userRankPoint);
                const isWinLoseGame = ['oxquiz', 'block', 'card'].includes(gameType);

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
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {gameIcons[gameType] || <QuizIcon />}
                          <Typography variant="h6" sx={{ fontWeight: '700', textTransform: 'capitalize', color: '#1976d2' }}>
                            {gameType}
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

                        {isWinLoseGame ? (
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: '600',
                              color: userRank === 1 ? '#4caf50' : '#f44336',
                            }}
                          >
                            {userRank === 1 ? '승리' : '패배'}
                          </Typography>
                        ) : (
                          <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#f57c00' }}>
                            순위: {getRankEmoji(userRank)}
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        플레이 시간: {formatDate(createdAt)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              }
            )}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default GameResultList;