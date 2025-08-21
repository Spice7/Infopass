import api from '../../user/api';

export const getCardQuestions = (subject, user_id) => api.post('/card/questions', { subject, user_id });
export const saveWrongNotes = (wrongQuestions) => api.post('/card/submit', { wrongQuestions });
export const saveGameResult = (result) => api.post('/card/saveResult', result);