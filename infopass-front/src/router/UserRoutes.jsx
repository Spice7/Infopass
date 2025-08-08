import React from 'react'
import SignupPage from '../user/SignupPage'
import { Route } from 'react-router-dom'
import LoginForm from '../user/LoginForm'
import UserForm from '../user/UserForm'
import User from '../user/User'


const UserRoutes = [
    <Route key="login" path='/login' element={<LoginForm />} />,
    <Route key="signup" path='/signup' element={<SignupPage />} />,
    <Route key="user" path='/user' element={<UserForm />} />,
    <Route key="userInfo" path="/user/info" element={<User />} />
    ]

export default UserRoutes