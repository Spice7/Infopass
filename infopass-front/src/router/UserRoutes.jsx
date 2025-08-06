import React from 'react'
import SignupPage from '../user/SignupPage'
import { Route } from 'react-router-dom'
import LoginForm from '../user/LoginForm'

import UserForm from '../user/UserForm'


const UserRoutes = [
    <Route key="LoginForm" path='/user/LoginForm' element={<LoginForm />} />,
    <Route key="SignupPage" path='/user/SignupPage' element={<SignupPage />} />,
    <Route key="UserForm" path='/user/UserForm' element={<UserForm />} />
    ]

export default UserRoutes