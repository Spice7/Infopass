import api from './api';

// 로그인
export const login = (data) => api.post(`/login`,data)

// 사용자 정보
export const info = () => api.get(`/user/info`)

// 회원 가입 
export const join = (data) => api.post(`/user`, data)

// 회원 정보 수정
export const update = (data) => api.put(`/user`, data)

// 회원 탈퇴
export const remove = (email) => api.delete(`/user/${email}`)