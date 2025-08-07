

import React, { useContext } from 'react'
import { Route, Router, Routes, Link } from 'react-router-dom'
import AdminRoutes from './AdminRoutes'
import UserRoutes from './UserRoutes'
import OxQuizRoutes from './OxQuizRoutes'
import BlockRoutes from './BlockRoutes'
import Home from '../pages/Home'
import MyPage from '../pages/mypage/MyPage.jsx'
import Ranking from "./Ranking";
import { LoginContext } from '../user/LoginContextProvider.jsx'

import MyPageRoutes from './MyPageRoutes'


const RouterMain = () => {
    const { isLogin, userInfo, logout } = useContext(LoginContext);

    return (
        <div>

            <header>
                <nav>
                    {isLogin ? (
                        <div>
                            <span>{userInfo.email}님 환영합니다.</span>
                            <Link to="/" onClick={logout}>로그아웃</Link>
                        </div>
                    ) : (
                        <div>
                            <Link to="/login">로그인</Link>
                            <Link to="/signup">회원가입</Link>
                        </div>
                    )}
                </nav>
            </header>
            <hr />
            <main>

            <Routes>
                <Route path="/" element={<Home />} />
                {MyPageRoutes}
                {AdminRoutes}
                {Ranking}
                {UserRoutes}
                {OxQuizRoutes}
                {BlockRoutes}
                <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
            </Routes>
            </main>
        </div>
        
    );
}

export default RouterMain;

