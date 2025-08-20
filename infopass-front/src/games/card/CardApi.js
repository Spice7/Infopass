// 새로운 세션 ID 생성
import * as auth from '../CardAuth';
export const generateNewSession = async () => {
    try {
      const response = await auth.post('/api/card/session/new');
      if (!response.data) {
        throw new Error('서버에서 세션 ID를 생성하지 못했습니다.');
      }
      return response.data;
    } catch (error) {
      console.error('Error generating new session:', error);
      throw error;
    }
  };
  
  // 세션별 문제 해결 여부 확인
  export const isQuestionSolvedBySession = async (questionId, sessionId) => {
    try {
      const response = await auth.post(`/api/card/questions/${questionId}/solved?sessionId=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking question solved status:', error);
      throw error;
    }
  };