// src/components/Home.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { LoginContext } from '../user/LoginContextProvider';

// 하단 퀵버튼 섹션 제거에 따라 불필요 배열 삭제

const Home = () => {
  const navigate = useNavigate();

  const games = useMemo(() => ([
    {
      key: 'ox',
      name: 'OX 퀴즈',
      players: '싱글/멀티 지원',
      desc: 'O 또는 X로 빠르게 판단하는 반응형 퀴즈',
      to: '/oxquiz/OX_main',
      thumbnail: '/ox_image/oxgame_logo.png'
    },
    {
      key: 'blank',
      name: '퀴즈(빈칸 채우기)',
      players: '싱글',
      desc: '개념을 채워 넣는 학습형 퀴즈',
      to: '/blankgamemain',
      thumbnail: '/ox_image/guide1.png'
    },
    {
      key: 'block',
      name: '블록 코딩',
      players: '싱글',
      desc: '블록을 조립하며 코딩 개념을 익혀요',
      to: '/block/main',
      thumbnail: '/ox_image/002ex.png'
    },
    {
      key: 'flip',
      name: '카드 뒤집기',
      players: '싱글',
      desc: '기억력과 집중력을 테스트해요',
      to: '/card/main',
      thumbnail: '/ox_image/alarm.png'
    },
    {
      key: 'algo-battle',
      name: '알고리즘 배틀',
      players: '멀티',
      desc: '실시간 문제 풀이 대전 모드 (개발 중)',
      to: '#',
      thumbnail: '/ox_image/fire.jpg',
      comingSoon: true
    },
    {
      key: 'typing-challenge',
      name: '타자 챌린지',
      players: '싱글',
      desc: '속도와 정확도를 겨루는 타자 게임 (개발 중)',
      to: '#',
      thumbnail: '/ox_image/laserGreen1.png',
      comingSoon: true
    },
  ]), []);

  // 모달 상태/핸들러
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback((g)=>{ setSelected(g); setModalOpen(true); },[]);
  const closeModal = useCallback(()=>{ setModalOpen(false); setTimeout(()=>setSelected(null),180); },[]);

  return (
    <div className="home-container">
      <div className="home-content">

        {/* 히어로 섹션 */}
        <div className="hero">
          <h1>게임처럼 배우는 코딩 & 퀴즈</h1>
          <p>즐겁게 플레이하며 실력을 키우세요</p>
        </div>

        {/* 전체 게임 그리드 */}
        <section className="game-section">
          <h2 className="grid-title">전체 게임</h2>
          <div className="game-grid">
            {games.map(g => (
              <div
                key={g.key}
                className={"game-card" + (g.comingSoon ? ' coming-soon' : '')}
                onClick={()=> openModal(g)}
                role="button"
                tabIndex={0}
                onKeyDown={(e)=>{ if(e.key==='Enter') openModal(g); }}
              >
                <div className="card-thumb" style={g.thumbnail ? {backgroundImage:`url(${g.thumbnail})`}:undefined} />
                <div className="card-info">
                  <h3 className="card-title">{g.name}</h3>
                  <p className="card-players">{g.players}</p>
                </div>
                {g.comingSoon && <span className="badge-coming">준비중</span>}
              </div>
            ))}
          </div>
        </section>

        {modalOpen && selected && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="home-game-modal" onClick={(e)=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="hg-title">
              <button className="modal-close" onClick={closeModal} aria-label="닫기">✕</button>
              <div className="modal-body">
                <div className="modal-thumb" style={selected.thumbnail ? {backgroundImage:`url(${selected.thumbnail})`}:undefined} />
                <h3 id="hg-title" className="modal-title">{selected.name}</h3>
                <p className="modal-players">{selected.players}</p>
                <p className="modal-desc">{selected.desc}</p>
              </div>
              <div className="modal-actions">
                <button
                  className={"start-btn" + (selected.comingSoon ? ' disabled' : '')}
                  disabled={!!selected.comingSoon}
                  onClick={()=>{ if(!selected.comingSoon){ closeModal(); navigate(selected.to);} }}
                >{selected.comingSoon ? '준비중' : '게임 시작'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;