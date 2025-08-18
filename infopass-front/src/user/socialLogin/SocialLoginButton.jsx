// LoginButtons.jsx
import React from 'react';
import Cookies from 'js-cookie'
import './SocialLoginButton.css';

export const KakaoLoginButton = () => {
  const REST_API_KEY = 'e1a223829a67fa4d5555d824be78d1c7';
  const REDIRECT_URI = 'http://localhost:5173/auth/callback/kakao'; // 프론트 콜백
  const state = crypto.randomUUID();
  Cookies.set('kakao_oauth_state', state);

  const kakaoUrl =
    `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&auth_type=reauthenticate`;

  return (
    <a href={kakaoUrl} className="social-login-link">
      <button className="social-login-btn kakao-btn">
        <img 
          src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" 
          alt="카카오 로그인" 
          className="social-login-icon"
        />
        <span>카카오</span>
      </button>
    </a>
  );
};

export const NaverLoginButton = () => {
  const NAVER_CLIENT_ID = 'kY3Gxh_p4svxg1tae7id';
  const REDIRECT_URI = 'http://localhost:5173/auth/callback/naver'; // 프론트 콜백
  const state = crypto.randomUUID();
  Cookies.set('naver_oauth_state', state);

  const naverUrl =
    `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&auth_type=reauthenticate`;

  return (
    <a href={naverUrl} className="social-login-link">
      <button className="social-login-btn naver-btn">
        <img 
          src="../../social_logo/naverLogo.png" 
          alt="네이버 로그인" 
          className="social-login-icon"
        />
        <span>네이버</span>
      </button>
    </a>
  );
};