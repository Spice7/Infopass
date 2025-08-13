import React from 'react'
import SignupPage from '../user/SignupPage'
import { Route } from 'react-router-dom'
import LoginForm from '../user/LoginForm'
import UserForm from '../user/UserForm'
import User from '../user/User'
import SocialLoginCallback from '../user/socialLogin/SocialLoginCallback'


const UserRoutes = [
    <Route key="login" path='/login' element={<LoginForm />} />,    
    <Route key="user" path='/user' element={<UserForm />} />,
    <Route key="userInfo" path="/user/info" element={<User />} />,
    <Route key="kakao" path="/auth/callback/kakao" element={<SocialLoginCallback provider="kakao" />} />,
    <Route key="naver" path="/auth/callback/naver" element={<SocialLoginCallback provider="naver" />} />,
    <Route Key="signup" path='/signup' element={<SignupPage />} />
    ]

export default UserRoutes