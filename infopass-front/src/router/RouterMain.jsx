import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import OxQuizRoutes from './OxQuizRoutes'
import BlockRoutes from './BlockRoutes'
import Home from '../pages/Home'
import MyPage from '../pages/mypage/MyPage.jsx'


const RouterMain = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/MyPage" element={<MyPage />} />
                {AdminRoutes}
                {UserRoutes}
                {OxQuizRoutes}
                {BlockRoutes}
                <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
            </Routes>
        </div>
    )
}

export default RouterMain
