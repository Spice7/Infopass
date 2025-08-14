
import api from './api';

// 로그인
export const login = (data) => api.post(`/login`,data)

// 사용자 정보
export const info = () => api.post(`/user/info`)

// 회원 가입 
export const join = (data) => api.post(`/user/join`, data)

// 회원 정보 수정
export const update = (id, data) => api.put(`/user/${id}`, data);

// 회원 탈퇴
export const remove = (email) => api.get(`/user/remove/${email}`)

// 이메일 중복 확인
export const checkId = (email) => api.post(`/user/checkId`, { email: email });

// 닉네임 중복 확인
export const checkNickName = (nickname) => api.post(`/user/checkNickName`, { nickname: nickname });

// 문자메세지 인증 요청
export const sendSms = (phone) => api.post(`/user/sendSms`, { phone: phone });

// 문자메세지 검증 요청
export const verifyCode = (smsToken, code) => api.post('/user/verifyCode', { smsToken: smsToken, code: code });

//소셜 로그인 
export const socialSignup = (provider, code) => api.post(`/user/social/${provider}`, { provider, code });

// 아이디 찾기
export const getResearchEmail = (name, phone) => api.post(`/user/getResearchEmail`, { name, phone });

// 비밀번호 찾기
export const findPw = (email, phone) => api.post(`/user/findPwCheck`, { email, phone });

// 새 비밀번호 변경
export const changePw = (email, phone, newPw) => api.post(`/user/changePw`, { email, phone, newPw });

export const getWrongAnswers = () => api.post('/wrong-answers');

