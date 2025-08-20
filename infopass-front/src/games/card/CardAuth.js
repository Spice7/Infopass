import api from '../../user/api';

export const getCardQuestions = (subject, user_id, question_id = [], session_id) =>
	api.post('/card/questions', { subject, user_id, question_id, session_id });

// CardSubDto 형태로 전송: { user_id, session_id, submitted_answer, is_correct }
/**
 * 문제 제출 및 정답 체크
 * @param {number} question_id - 문제 ID
 * @param {Object} submissionData - 제출 데이터
 * @returns {Promise<Object>} 제출 결과
 */
export const saveSubmission = (dtoList) => api.post(`/card/questions/submit`, dtoList);
export const generateNewSession = () => api.get('/card/session/new');
export const saveGameResult = (data) => api.post('/card/game/result', data);