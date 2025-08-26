import axios from "axios";
import Cookies from "js-cookie";
import { triggerLogout } from "./authUtils";

// axios 객체 생성
const api = axios.create({
  baseURL: "http://localhost:9000",
  withCredentials: true, // 쿠키를 요청에 포함시키기 위해 필요
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 Authorization 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    // ⚠️ 수정할 부분: localStorage에서 토큰을 가져와 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // ⚠️ CSRF 토큰이 필요하다면 아래처럼 추가
    // const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    // if (csrfToken) {
    //   config.headers['X-CSRF-TOKEN'] = csrfToken;
    // }
    console.log("Token in header:", accessToken);
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
