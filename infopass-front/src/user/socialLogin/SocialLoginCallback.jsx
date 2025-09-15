// SocialLoginCallback.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as auth from '../auth';
import Cookies from 'js-cookie'
import { LoginContext } from '../LoginContextProvider';
import { AlertDialog } from '../RequireLogin';

function SocialLoginCallback({ provider }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCheck } = useContext(LoginContext);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

  //중복 호출 방지
  const calledRef = useRef(false);

  useEffect(() =>  {
    if (calledRef.current) return; // 중복 호출 방지
    calledRef.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    console.log("code: ", code);
    console.log("state: ", state);    
    if (!code) {
      setAlertData({
        title: '인증 오류',
        message: '인증 코드가 없습니다.'
      });
      setAlertOpen(true);
      navigate('/login');
      return;
    }

    // 저장해둔 state와 비교(선택적이지만 권장)
    const key = provider === 'naver' ? 'naver_oauth_state' : 'kakao_oauth_state';
    const storedState = Cookies.get(key);
    console.log("storedState: ",storedState);
    console.log("code: ", code, "state: ", state);
    if (state && storedState && state !== storedState) {
      setAlertData({
        title: '보안 오류',
        message: 'CSRF 검증 실패(state 불일치)'
      });
      setAlertOpen(true);
      navigate('/login');
      return;
    }

     auth.socialSignup(provider, { code, state })
      .then(res => {
        const data = res.data;
        console.log("소셜사용자정보: ",data);
        if (data.login){
          // 이미 회원 → 바로 로그인 처리
          // 예: 토큰 저장, 메인 페이지 이동 등
          Cookies.set('accessToken', data.token);
          Cookies.set('user', JSON.stringify(data.user));
          loginCheck(); // Context에 로그인 상태 반영
          navigate('/');
        } else {
          //신규 회원 → 회원가입 폼 안내
          navigate('/login', { state: { socialUser: res.data } });
        }   
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.error) {
          setAlertData({
            title: '가입 오류',
            message: err.response.data.error // "이미 가입된 이메일입니다." 안내
          });
        } else {
          setAlertData({
            title: '오류',
            message: '알 수 없는 오류가 발생했습니다.'
          });
        }
        setAlertOpen(true);
        navigate('/login');
      });
  }, [provider, location.search]);

  return (
    <>
      <div>로그인 중입니다...</div>
      
      {/* 알림 다이얼로그 */}
      <AlertDialog
        open={alertOpen}
        title={alertData.title}
        message={alertData.message}
        onConfirm={() => setAlertOpen(false)}
      />
    </>
  );
}

export default SocialLoginCallback;