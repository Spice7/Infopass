// SocialLoginCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as auth from '../auth';
import Cookies from 'js-cookie'

function SocialLoginCallback({ provider }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() =>  {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code) {
      alert('인증 코드가 없습니다.');
      navigate('/login');
      return;
    }

    // 저장해둔 state와 비교(선택적이지만 권장)
    const key = provider === 'naver' ? 'naver_oauth_state' : 'kakao_oauth_state';
    const storedState = sessionStorage.getItem(key);
    if (state && storedState && state !== storedState) {
      alert('CSRF 검증 실패(state 불일치)');
      navigate('/login');
      return;
    }

     auth.socialSignup(provider, { code, state })
      .then(res => {
        console.log("소셜사용자정보: ",res.data);
        // const { token, user } = res.data;
        // Cookies.set('jwtToken', token);
        // Cookies.set('user', JSON.stringify(user));
        console.log()
        navigate('/login', { state: { socialUser: res.data } });
      })
      .catch(err => {
        console.error('Callback Error: ', err);
        alert('로그인 실패');
        navigate('/login');
      });
  }, [provider, location.search, navigate]);

  return <div>로그인 중입니다...</div>;
}

export default SocialLoginCallback;