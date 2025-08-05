import React from 'react'
import SignupPage from '../user/SignupPage'
import Login from '../user/Login'
import { Route } from 'react-router-dom'

const UserRoutes = [
    <Route key="Login" path='/user/Login' element={<Login />} />,
    <Route key="SignupPage" path='/user/SignupPage' element={<SignupPage />} />
    ]

export default UserRoutes