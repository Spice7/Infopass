import api from '@/user/api'

// 경험치 증가량
export const BLOCKGAME_EXP = 50;

//오답 노트 가져오기
export const getWrongAnswers = () => api.post('/wrong-answers');

// 게임 결과 가져오기
export const getGameResults = () => api.post('/results');

// 공용으로 사용할 경험치 증가 메소드
export const applyExp = (expDelta) => api.post('/results/exp/apply', {expDelta: expDelta});

// 레벨업 검토  // 경험치 계산 후 레벨 계산
export const checkLevelUp = () => api.post('/results/level');