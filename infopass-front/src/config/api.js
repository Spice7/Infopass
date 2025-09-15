// API 설정 파일
// 환경변수 VITE_API_BASE_URL이 설정되지 않은 경우 기본값 사용
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

// WebSocket URL 설정
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:9000';

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 랭킹 관련
  RANK_WEEKLY: `${API_BASE_URL}/rank?type=weekly`,
  RANK_REALTIME: `${API_BASE_URL}/rank?type=realtime`,
  
  // 게임 관련
  ROOMS: `${API_BASE_URL}/api/rooms`,
  BLANK_QUIZ_LIST: `${API_BASE_URL}/blankgamesingle/blankquizlist`,
  BLANK_SUBMIT: `${API_BASE_URL}/blankgamesingle/submitblankquiz`,
  BLANK_WRONG_ANSWER: `${API_BASE_URL}/blankgamesingle/blankwronganswer`,
  BLANK_USER_STATUS: `${API_BASE_URL}/blankgamesingle/blankinsertuserstatus`,
  
  // OX 퀴즈 관련
  OX_QUIZ_LIST: `${API_BASE_URL}/oxquiz/quizlist`,
  OX_SUBMIT: `${API_BASE_URL}/oxquiz/submitOXquiz`,
  OX_WRONG_ANSWER: `${API_BASE_URL}/oxquiz/wronganswer`,
  OX_USER_STATUS: `${API_BASE_URL}/oxquiz/InsertUserStatus`,
  OX_MULTI_RESULT: `${API_BASE_URL}/oxquiz/multiresult`,
  OX_END_GAME: `${API_BASE_URL}/oxquiz/EndGame`,
  
  // 로비 관련
  LOBBY_OX: `${API_BASE_URL}/lobby/ox`,
  
  // WebSocket
  WS_GAME: `${WS_BASE_URL}/ws-game`,
};

// 개발/배포 환경 확인
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', IS_PRODUCTION ? 'Production' : 'Development');
