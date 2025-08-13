// LoginButtons.jsx
import React from 'react';

export const KakaoLoginButton = () => {
  const REST_API_KEY = 'fa7d04c313de20f6b40342ac0b591b34';
  const REDIRECT_URI = 'http://localhost:5173/auth/callback/kakao'; // 프론트 콜백
  const state = crypto.randomUUID();
  sessionStorage.setItem('kakao_oauth_state', state);

  const kakaoUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${state}`;

  return <a href={kakaoUrl}><button>카카오 로그인</button></a>;
};

export const NaverLoginButton = () => {
  const NAVER_CLIENT_ID = 'kY3Gxh_p4svxg1tae7id';
  const REDIRECT_URI = 'http://localhost:5173/auth/callback/naver'; // 프론트 콜백
  const state = crypto.randomUUID();
  sessionStorage.setItem('naver_oauth_state', state);

  const naverUrl =
    `https://nid.naver.com/oauth2.0/authorize` +
    `?response_type=code` +
    `&client_id=${NAVER_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${state}`;

  return <a href={naverUrl}><button>네이버 로그인</button></a>;
};