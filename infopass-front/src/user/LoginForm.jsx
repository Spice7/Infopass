import React, { useContext } from 'react'
import { LoginContext } from './LoginContextProvider'
import { useLocation } from 'react-router-dom';

const LoginForm = () => {
    const { login } = useContext(LoginContext)          // 📦 LoginContext 의 login 함수

    const location = useLocation();
    console.log(location.state?.from); // 로그인 전 페이지 경로

    const onLogin = (e) => {
        e.preventDefault()                      // 기본 이벤트 방지 
        const form = e.target                   // <form> 요소
        const username = form.username.value    // 아이디   - <form> 아래 input name="username" 의 value
        const password = form.password.value    // 비밀번호 - <form> 아래 input name="passwword" 의 value
        
                  // 로그인 처리 요청
        login(username, password, location) // LoginContextProvider 의 login 함수 호출
    }
    return (
        <div className="form">
            <h2 className="login-title">Login</h2>

            <form className='login-form' onSubmit={ (e) => onLogin(e) }>
                <div>
                    <label htmlFor="name">username</label>
                    <input type="text"
                           id='username'
                           placeholder='username'
                           name='username'
                           autoComplete='username'
                           required
                    />
                </div>
                <div>
                    <label htmlFor="password">password</label>
                    <input type="password"
                           id='passowrd'
                           placeholder='password'
                           name='password'
                           autoComplete='password'
                           required
                    />
                </div>
                <button type='submit' className='btn btn--form btn-login'>
                    Login                    
                </button>
            </form>
        </div>
    )
}
export default LoginForm