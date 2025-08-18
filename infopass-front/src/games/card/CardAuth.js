import api from '../../user/api';

export const getCardQuestions = () => api.post('/card/questions');
export const saveWrongNotes = (wrongQuestions) => api.post('/card/submit', { wrongQuestions });
export const saveGameResult = (result) => api.post('/card/saveResult', result);