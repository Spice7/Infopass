import React, { useContext } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';
import OxQuizRoutes from './OxQuizRoutes';
import { LoginContext } from '../user/LoginContextProvider';

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
                            <Link to="/user/LoginForm">로그인</Link>
                            <Link to="/user/SignupPage">회원가입</Link>
                        </div>
                    )}
                </nav>
            </header>
            <hr />
            <main>
                <Routes>
                    {AdminRoutes}
                    {UserRoutes}
                    {OxQuizRoutes}
                    <Route path='*' element={<h1>잘못된 주소입니다</h1>} />
                </Routes>
            </main>
        </div>
    );
};

export default RouterMain;
