// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const defaultMenuItems = [
  { path: '/block/main', label: '🧩 Scratch', desc: '코딩 학습을 위한 블록형 언어' },
  { path: '/flip', label: '🃏 카드 뒤집기', desc: '재미있는 복습 방법' },
  { path: '/rank', label: '🏆 랭킹 보드', desc: '친구들과 순위를 겨뤄보세요' },
  { path: '/inquiry', label: '📬 문의', desc: '궁금한 점을 남겨주세요' },
];

const loggedInAuthItems = [
  { path: '/mypage', label: '👤 마이페이지', desc: '나의 학습 현황 확인' },
];

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <h1>🧠 OX 퀴즈 & 학습 플랫폼</h1>
          <p>게임처럼 즐기며 배우고, 나만의 오답노트를 남겨보세요!</p>
          {/* 로그인 토글 버튼 제거 */}
        </header>

        <section className="main-section">
          <Link to="/blankgamemain" className="main-card large">
            <h2>🎮 퀴즈 게임 시작하기</h2>
            <p>오늘의 퀴즈를 풀고 실력을 점검해 보세요!</p>
          </Link>
         
          <Link to="/oxquiz/OX_main" className="main-card large">

            <h2>🎮 ox퀴즈 게임 시작하기</h2>
            <p>오늘의 퀴즈를 풀고 실력을 점검해 보세요!</p>
          </Link>

          <div className="secondary-cards">
            <Link to="/wrongnote" className="main-card small">
              <h3>📓 오답노트</h3>
              <p>틀린 문제만 모아서 완벽하게 정복</p>
            </Link>
            {/* 로그인 상태일 때만 보여주는 메뉴 */}
            {loggedInAuthItems.map((item, index) => (
              <Link key={index} to={item.path} className="main-card small">
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card-grid">
          {defaultMenuItems.map((item, index) => (
            <Link key={index} to={item.path} className="card">
              <h4>{item.label}</h4>
              <p>{item.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Home;
