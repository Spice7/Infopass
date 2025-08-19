import React, { useContext, useEffect } from 'react'
import { LoginContext } from './LoginContextProvider'
import { useLocation, useNavigate } from 'react-router-dom';
import SignupPage from './SignupPage';
import { KakaoLoginButton, NaverLoginButton } from './socialLogin/SocialLoginButton';
import FindIdModal from './FindIdModal';
import FindPwModal from './FindPwModal';
import './userInfo.css';

const LoginForm = () => {
    const { login, openSignUpModal, openSignUpModalWithUser } = useContext(LoginContext)

    const navi = useNavigate();
    const location = useLocation();
    
    // location.state?.socialUser 에 소셜 로그인 후 받은 사용자 정보가 있다면 모달 열기
    useEffect(() => {
        if (location.state?.socialUser) {
            openSignUpModalWithUser(location.state.socialUser);
            // 상태 초기화
            navi(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.socialUser, openSignUpModalWithUser, location.pathname, navi]);

    const onLogin = (e) => {
        e.preventDefault()
        const form = e.target
        const email = form.email.value
        const password = form.password.value

        // 로그인 처리 요청
        login(email, password, location)
    }

    return (
        <>
            <div className="login-form-container">
                <h2 className="login-title">로그인</h2>

                <form className='login-form' onSubmit={(e) => onLogin(e)}>                
                    <div className="login-input-container">
                        <label htmlFor="email">아이디</label>
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
                    
                    {/* 로그인/회원가입 버튼 그룹 */}
                    <div className="auth-buttons-group">
                        <button type='submit' className='btn btn-form btn-login'>
                            로그인
                        </button>
                        <button type='button' className='btn btn-form btn-signup'
                            onClick={openSignUpModal}>
                            회원가입
                        </button>
                    </div>
                </form>
                
                {/* 아이디/비밀번호 찾기 버튼 그룹 */}
                <div className="find-buttons-group">
                    <FindIdModal />
                    <FindPwModal />
                </div>
                
                {/* 소셜 로그인 버튼 그룹 */}
                <div className="social-login-container">
                    <KakaoLoginButton />
                    <NaverLoginButton />
                </div>
            </div>

            {/* 회원가입 모달 */}
            <SignupPage />
        </>
    )
}

export default LoginForm