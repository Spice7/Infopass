import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css' // 스타일 분리 가능

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🧠 OX 퀴즈 & 학습 플랫폼</h1>
        <p>게임처럼 즐기며 배우고, 나만의 오답노트를 남겨보세요!</p>
      </header>

      <section className="card-grid">
        <Link to="/oxquiz" className="card">🎮 퀴즈 게임</Link>
        <Link to="/scratch" className="card">🧩 Scratch</Link>
        <Link to="/flip" className="card">🃏 카드 뒤집기</Link>
        <Link to="/mypage" className="card">👤 마이페이지</Link>
        <Link to="/wrongnote" className="card">📓 오답노트</Link>
        <Link to="/inquiry" className="card">📬 문의</Link>
        <Link to="/rank" className="card">🏆 랭킹 보드</Link>
        <Link to="/admin" className="card">🛠 관리자</Link>
        <Link to="/login" className="card">🔐 로그인</Link>
        <Link to="/signup" className="card">📝 회원가입</Link>
      </section>
    </div>
  )
}

export default Home
