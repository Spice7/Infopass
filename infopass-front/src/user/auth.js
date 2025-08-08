import api from './api';

// 로그인
export const login = (data) => api.post(`/login`,data)

// 사용자 정보
export const info = () => api.post(`/user/info`)

// 회원 가입 
export const join = (data) => api.post(`/user/join`, data)

// 회원 정보 수정
export const update = (data) => api.post(`/user/update`, data)

// 회원 탈퇴
export const remove = (email) => api.get(`/user/remove/${email}`)

// 이메일 중복 확인
export const checkId = (email) => api.post(`/user/checkId`, { email: email });

// 닉네임 중복 확인
export const checkNickName = (nickname) => api.post(`/user/checkNickName`, { nickname: nickname });