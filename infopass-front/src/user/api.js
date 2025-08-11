import axios from 'axios';
import Cookies from 'js-cookie';
import { triggerLogout } from './authUtils';

// axios 객체 생성
const api = axios.create({
    baseURL: 'http://localhost:9000',
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 Authorization 헤더에 추가
api.interceptors.request.use(
    (config) => {
        const accessToken = Cookies.get('accessToken');
        console.log('Token in header:', accessToken);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 401 Unauthorized 에러 처리
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 401 에러 발생 시 로그아웃 처리
            triggerLogout();
        }
        return Promise.reject(error);
    }
);

export default api;