import api from '@/user/api';

// 문의 제출
export const submitInquiry = (data) => api.post(`/inquiries`, data);

// 문의 목록 조회 (예시)
export const getMyInquiries = () => api.get(`/inquiries/my`);