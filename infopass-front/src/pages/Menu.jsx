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
                    <div className="site-logo" onClick={() => navigate('/')}>
                        <img src="/infopass_logo.png" style={{width: '90px', height: '65px'}} alt="INFOPASS OX Logo"/>
                    </div>
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
            <aside className={`side-drawer ${drawerOpen ? 'open' : ''}`} aria-label="사이드 메뉴">
                <div className="drawer-header">
                    <span className="drawer-title">메뉴</span>
                    <button className="close-btn" onClick={() => setDrawerOpen(false)} aria-label="닫기">✕</button>
                </div>
                <nav className="drawer-nav" role="navigation">
                    {/* 기본 섹션 */}
                    <div className="drawer-section">
                        <Link to="/" className="drawer-link" onClick={() => setDrawerOpen(false)}>🏠 <span>홈</span></Link>
                        <button className="drawer-link recent" type="button" disabled title="준비 중" style={{opacity:.55}}>🕒 <span>최근 플레이한 게임</span></button>
                    </div>
                    <div className="drawer-separator" />
                    {/* 게임 섹션 */}
                    <div className="drawer-heading">게임</div>
                    <div className="drawer-section games">
                        <Link to="/ox/single" className="drawer-link" onClick={() => setDrawerOpen(false)}>⭕❌ <span>OX퀴즈</span></Link>
                        <Link to="/blank" className="drawer-link" onClick={() => setDrawerOpen(false)}>📝 <span>빈칸채우기 퀴즈</span></Link>
                        <Link to="/block" className="drawer-link" onClick={() => setDrawerOpen(false)}>🧱 <span>블록 코딩</span></Link>
                        <Link to="/card" className="drawer-link" onClick={() => setDrawerOpen(false)}>🃏 <span>카드 뒤집기</span></Link>
                    </div>
                    <div className="drawer-separator" />
                    {/* 커뮤니티/기타 */}
                    <div className="drawer-heading">서비스</div>
                    <div className="drawer-section etc">
                        <Link to="/rank" className="drawer-link" onClick={() => setDrawerOpen(false)}>🏆 <span>랭킹</span></Link>
                        <Link to="/support" className="drawer-link" onClick={() => setDrawerOpen(false)}>💬 <span>문의하기</span></Link>
                        <Link to="/notice" className="drawer-link" onClick={() => setDrawerOpen(false)}>📢 <span>공지사항</span></Link>
                        <Link to="/coffee" className="drawer-link" onClick={() => setDrawerOpen(false)}>☕ <span>개발자에게 커피쏘기</span></Link>
                    </div>
                    <div className="drawer-separator" />
                    {/* 사용자 섹션 */}
                    <div className="drawer-heading">내 메뉴</div>
                    <div className="drawer-section user-sec">
                        {isLogin && (
                          <div className="drawer-link user-static" aria-label="로그인 사용자">🙍 <span style={{border:'1px solid white', borderRadius:'20px', padding:'2px 4px', width:'80px', background: 'linear-gradient(90deg,var(--accent2),var(--accent))',color:'black'}}>{userInfo?.nickname}</span></div>
                        )}
                        <Link to="/mypage" className="drawer-link" onClick={() => setDrawerOpen(false)}>📂 <span>마이페이지</span></Link>
                        <Link to="/wrongnote" className="drawer-link" onClick={() => setDrawerOpen(false)}>📓 <span>오답노트</span></Link>
                        <Link to="/records" className="drawer-link" onClick={() => setDrawerOpen(false)}>📊 <span>게임 기록</span></Link>
                    </div>
                </nav>
                <div className="drawer-footer">
                    {isLogin ? (
                      <button onClick={handleLogout} className="logout-inline" aria-label="로그아웃">로그아웃</button>
                    ) : (
                      <Link to="/login" onClick={() => setDrawerOpen(false)} className="login-inline">로그인</Link>
                    )}
                    <small>© 2025 INFOPASS</small>
                </div>
            </aside>
            {drawerOpen && <div className="overlay" onClick={() => setDrawerOpen(false)} />}
        </div>
    );
};

export default Menu;
