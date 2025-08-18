import React, { useContext, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginContext } from '../user/LoginContextProvider';
import './menu.css';

const Menu = () => {
        const { isLogin, userInfo, logout } = useContext(LoginContext);
        const navigate = useNavigate();
        const [drawerOpen, setDrawerOpen] = useState(false);


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            {/* 상단 고정 헤더 */}
            <header className="top-bar">
                <div className="top-left">
                    <button className={"hamburger" + (drawerOpen ? ' active' : '')} onClick={() => setDrawerOpen(o => !o)} aria-label="메뉴">
                        <span />
                        <span />
                        <span />
                    </button>
                    <div className="site-logo" onClick={() => navigate('/')}>INFOPASS OX</div>
                </div>
                <div className="top-right">
                    <Link to="/mypage" className="nav-btn">마이페이지</Link>
                    <Link to="/rank" className="nav-btn">랭킹</Link>
                    {isLogin ? (
                        <button onClick={handleLogout} className="nav-btn primary">로그아웃</button>
                    ) : (
                        <Link to="/login" className="nav-btn primary">로그인</Link>
                    )}
                </div>
            </header>

            {/* 사이드 드로어 */}
            <aside className={`side-drawer ${drawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <span className="drawer-title">메뉴</span>
                    <button className="close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
                </div>
                <nav className="drawer-nav" onClick={() => setDrawerOpen(false)}>
                    <Link to="/ox/single">싱글 OX</Link>
                    <Link to="/ox/lobby">멀티 로비</Link>
                    <Link to="/records">기록</Link>
                    <Link to="/rank">랭킹</Link>
                    <Link to="/help">도움말</Link>
                </nav>
                <div className="drawer-footer">
                    {isLogin && <div className="user-chip">{userInfo?.nickname}</div>}
                    <small>© 2025 INFOPASS</small>
                </div>
            </aside>
            {drawerOpen && <div className="overlay" onClick={() => setDrawerOpen(false)} />}
        </div>
    );
};

export default Menu;
