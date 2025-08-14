import React, { useContext, useEffect, useState } from 'react'
import { LoginContext } from './LoginContextProvider'
import { useLocation, useNavigate } from 'react-router-dom';
import SignupPage from './SignupPage';
import { KakaoLoginButton, NaverLoginButton } from './socialLogin/SocialLoginButton';
import FindIdModal from './FindIdModal';
import FindPwModal from './FindPWModal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import './userInfo.css';

const LoginForm = () => {
    const { login, openSignUpModal, openSignUpModalWithUser } = useContext(LoginContext)          // 📦 LoginContext 의 login 함수

    const navi = useNavigate();
    const location = useLocation();
    //console.log(location.state?.from); // 로그인 전 페이지 경로

    // location.state?.socialUser 에 소셜 로그인 후 받은 사용자 정보가 있다면 모달 열기
    useEffect(() => {
    
        if (location.state?.socialUser) {
            openSignUpModalWithUser(location.state.socialUser);

            // 상태 초기화
            navi(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.socialUser, openSignUpModalWithUser]);
   
    const [showFindId, setShowFindId] = useState(false);
    const [showFindPw, setShowFindPw] = useState(false);

    const onLogin = (e) => {
        e.preventDefault()                      // 기본 이벤트 방지 
        const form = e.target                   // <form> 요소
        const email = form.email.value    // 아이디   - <form> 아래 input name="username" 의 value
        const password = form.password.value    // 비밀번호 - <form> 아래 input name="passwword" 의 value

        // 로그인 처리 요청
        login(email, password, location) // LoginContextProvider 의 login 함수 호출
    }

    return (
        <>
            <div className="login-form-container">
                <h2 className="login-title">로그인</h2>

                <form className='login-form' onSubmit={(e) => onLogin(e)}>                
                    <div className="login-input-container">
                        <label htmlFor="name">아이디</label>
                        <input type="text"
                            id='email'
                            placeholder='이메일'
                            name='email'
                            autoComplete='email'
                            required
                        />
                    </div>
                    <div className="login-input-container">
                        <label htmlFor="password">비밀번호</label>
                        <input type="password"
                            id='password'
                            placeholder='비밀번호'
                            name='password'
                            autoComplete='password'
                            required
                        />
                    </div>
                    <button type='submit' className='btn btn-form btn-login'>
                        로그인
                    </button>
                    <button type='button' className='btn btn-form btn-signup'
                        onClick={openSignUpModal}>
                        회원가입
                    </button>
                </form>
                <button type='button' className='btn btn-id' onClick={() => setShowFindId(true)}>아이디 찾기</button>
                <button type='button' className='btn btn-password' onClick={() => setShowFindPw(true)}>비밀번호 찾기</button>
                <div className="social-login-container">
                    <KakaoLoginButton />
                    <NaverLoginButton />
                </div>
            </div>

            {/* 아이디 찾기 모달 */}
            <Modal
                open={showFindId}
                onClose={() => setShowFindId(false)}
                aria-labelledby="find-id-modal-title"
                aria-describedby="find-id-modal-description"
            >
                <Box className="find-id-modal-container">
                    <Typography id="find-id-modal-title" variant="h6" component="h2">
                        <div className="infoTextFrame">
                            <span className="userinfoText">아이디 찾기</span>
                        </div>
                    </Typography>
                    <Typography id="find-id-modal-description" component='div' sx={{ mt: 2 }}>
                        <FindIdModal onClose={() => setShowFindId(false)} />
                    </Typography>
                </Box>
            </Modal>

            {/* 비밀번호 찾기 모달 */}
            <Modal
                open={showFindPw}
                onClose={() => setShowFindPw(false)}
                aria-labelledby="find-pw-modal-title"
                aria-describedby="find-pw-modal-description"
            >
                <Box className="find-pw-modal-container">
                    <Typography id="find-pw-modal-title" variant="h6" component="h2">
                        <div className="infoTextFrame">
                            <span className="userinfoText">비밀번호 찾기</span>
                        </div>
                    </Typography>
                    <Typography id="find-pw-modal-description" component='div' sx={{ mt: 2 }}>
                        <FindPwModal onClose={() => setShowFindPw(false)} />
                    </Typography>
                </Box>
            </Modal>

            <SignupPage />
        </>
    )
}
export default LoginForm