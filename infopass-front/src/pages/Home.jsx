// src/components/Home.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { LoginContext } from '../user/LoginContextProvider';
import Menu from './menu';


// 하단 퀵버튼 섹션 제거에 따라 불필요 배열 삭제

const Home = () => {
  const navigate = useNavigate();
  const { checkgamehome, setcheckgamehome } = useState('/');
  <Menu checkgame={checkgamehome} />
  const games = useMemo(() => ([
    {
      key: 'ox',
      name: 'OX 퀴즈',
      players: '싱글/멀티 지원',
      mode: '싱글 / 멀티',
      // 소개
      highlight: '정보처리기사 5과목 문제가 무작위로 쏟아진다',
      details: [
        '5분 제한 안에 O 또는 X를 번개처럼 골라 최대한 많이 생존하라.',
        '3번 틀리면 게임 오버, 목숨 관리가 관건!',
        '멀티에서는 같은 문제를 동시에 풀며 누가 더 오래 버티는지 심리전까지.'
      ],
      desc: '정보처리기사 5과목 문제가 무작위로 쏟아진다! 5분 제한 안에 O 또는 X를 번개처럼 골라 최대한 많이 생존하라. 3번 틀리면 게임 오버, 목숨 관리가 관건! 멀티에서는 같은 문제를 동시에 풀며 누가 더 오래 버티는지 심리전까지.',
      to: '/oxquiz/OX_main',
      thumbav: '/gamelogo/OxquizAd.gif',
      thumbnail: '/gamelogo/OxquizLogo.png',
      dev: 'Infopass Team - 박용희',
      release: '2025.08.15',
      tech: 'React · SockJS · STOMP · Spring',
    },
    {
      key: 'blank',
      name: '스피드 퀴즈',
      players: '싱글/멀티 지원',
      mode: '싱글 / 멀티',
      // 소개
      highlight: '정보처리기사 5과목 핵심 용어 빈칸이 랜덤 출제',
      details: [
        '5분 동안 빠르게 정확한 단어를 입력해 콤보를 이어가라.',
        '3회 오답 시 종료, 남은 목숨이 곧 집중력 지표.',
        '멀티에서는 동일 문제 실시간 경쟁 & 체력(목숨) 싸움.'
      ],
      desc: '정보처리기사 5과목 핵심 용어 빈칸이 랜덤 출제! 5분 동안 빠르게 정확한 단어를 입력해 콤보를 이어가라. 3회 오답 시 종료, 남은 목숨이 곧 집중력 지표. 멀티에서는 동일 문제 실시간 경쟁 & 체력(목숨) 싸움.',
      to: '/blankgamemain',
      thumbav: '/gamelogo/BlankquizAd.gif',
      thumbnail: '/gamelogo/BlankquizLogo.png',
      dev: 'Infopass Team - 이창연',
      release: '2025.08.16',
      tech: 'React · SockJS · STOMP · Spring',
    },
    {
      key: 'block',
      name: '블록 코딩',
      players: '싱글',
      mode: '싱글',
      // 소개
      highlight: '주어진 코드 속 빈칸을 올바른 알고리즘/구문 블록으로 채워 “정상 실행”을 완성하라',
      details: [
        '문제를 해석 → 로직 추론 → 블록 선택 순으로 사고력을 단련.',
        '퍼즐처럼 맞춰지며 동작할 때의 쾌감이 핵심.'
      ],
      desc: '주어진 코드 속 빈칸을 올바른 알고리즘/구문 블록으로 채워 “정상 실행”을 완성하라. 문제를 해석 → 로직 추론 → 블록 선택 순으로 사고력을 단련. 퍼즐처럼 맞춰지며 동작할 때의 쾌감이 핵심.',
      to: '/block/main',
      thumbav: '/gamelogo/BlockquizAd.gif',
      thumbnail: '/gamelogo/BlockGameLogo.png',
      dev: 'Infopass Team - 이건호',
      release: '2025.08.19',
      tech: 'React · Blockly · Spring',
    },
    {
      key: 'flip',
      name: '카드 뒤집기',
      players: '싱글',
      mode: '싱글',
      // 소개
      highlight: '문제 카드와 정답 카드가 섞여있는 기억 매칭 게임',
      details: [
        '한 장씩 뒤집으며 개념-정의 짝을 찾아내라.',
        '패턴 기억 & 위치 추적이 관건, 후반 갈수록 두뇌 워밍업 효과 UP.'
      ],
      desc: '문제 카드와 정답 카드가 섞여있는 기억 매칭 게임. 한 장씩 뒤집으며 개념-정의 짝을 찾아내라. 패턴 기억 & 위치 추적이 관건, 후반 갈수록 두뇌 워밍업 효과 UP.',
      to: '/card/main',
      thumbav: '/gamelogo/CardquizAd.gif',
      thumbnail: '/gamelogo/CardGameLogo.png',
      dev: 'Infopass Team - 이정민',
      release: '2025.08.20',
      tech: 'React · Spring',
    },
    {
      key: 'algo-battle',
      name: '알고리즘 배틀',
      players: '멀티',
      mode: '멀티 (개발 중)',
      desc: '실시간 문제 풀이 대전 모드 (개발 중)',
      to: '#',
      thumbnail: '/gamelogo/NoneGameLogo.png',
      comingSoon: true,
      dev: 'Infopass Team - 김기범',
      release: '개발 중',
      tech: 'React · WebSocket · Spring',
    },
    {
      key: 'typing-challenge',
      name: '타자 챌린지',
      players: '싱글',
      mode: '싱글 (개발 중)',
      desc: '속도와 정확도를 겨루는 타자 게임 (개발 중)',
      to: '#',
      thumbnail: '/gamelogo/NoneGameLogo.png',
      comingSoon: true,
      dev: 'Infopass Team - 김기범',
      release: '개발 중',
      tech: 'React',
    },
  ]), []);

  // 모달 상태/핸들러
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback((g) => { setSelected(g); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setTimeout(() => setSelected(null), 180); }, []);

  return (
    <div className="home-container">
      <div className="home-content">

        {/* 히어로 섹션 */}
        <div className="hero">
          <h1>
            <span style={{
              background: 'linear-gradient(90deg, #ffe066, #b5aaff 45%, #ffb3e6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              게임처럼 배우는 코딩 & 퀴즈
            </span>
          </h1>
          <p style={{ fontSize: '1.18rem', color: '#ffe066', fontWeight: 700, marginBottom: 8 }}>
            🚀 지금, 재미와 실력을 동시에!
          </p>
          <p style={{ color: '#c9d6ff', fontSize: '1.08rem', marginBottom: 0 }}>
            단순한 공부는 그만!
            <span style={{ color: '#ffd6e0', fontWeight: 600 }}>실전 문제, 실시간 대결,</span>
            그리고 <span style={{ color: '#b5aaff', fontWeight: 600 }}>다양한 게임 모드</span>로
            <br />
            <span style={{ color: '#ffe066', fontWeight: 700 }}>즐겁게 실력을 키워보세요.</span>
          </p>
          <p style={{ color: '#b3c9ff', fontSize: '1.01rem', marginTop: 10 }}>
            정보처리기사, 알고리즘, 코딩 실력까지!
            <span style={{ color: '#ffd6e0', fontWeight: 600 }}>누구나 쉽게, 누구나 즐겁게</span>
            <br />
            <span style={{ color: '#b5aaff', fontWeight: 600 }}>Infopass</span>에서 도전하세요!
          </p>
        </div>

        {/* 전체 게임 그리드 */}
        <section className="game-section">
          <h2 className="grid-title">전체 게임</h2>
          <div className="home-game-grid">
            {games.map(g => (
              <div
                key={g.key}
                className={"game-card" + (g.comingSoon ? ' coming-soon' : '')}
                onClick={() => openModal(g)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') openModal(g); }}
              >
                <div className="card-thumb" style={g.thumbnail ? { backgroundImage: `url(${g.thumbnail})` } : undefined} />
                <div className="card-info">
                  <h3 className="card-title">{g.name}</h3>
                  <p className="card-players">{g.players}</p>
                  <p className='card-highlight'>{g.highlight}</p>
                </div>
                {g.comingSoon && <span className="badge-coming">준비중</span>}
              </div>
            ))}
          </div>
        </section>

        {modalOpen && selected && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="home-game-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="hg-title">
              <button className="modal-close" onClick={closeModal} aria-label="닫기">✕</button>
              <div className="modal-body">
                <div className="modal-breadcrumb">게임 <span className="chevron">&gt;&gt;</span> <strong>{selected.name}</strong></div>
                <div className="home-modal-thumb" style={(selected.thumbav || selected.thumbnail) ? { backgroundImage: `url(${selected.thumbav || selected.thumbnail})` } : undefined} />
                <h3 id="hg-title" className="modal-title">{selected.name}</h3>
                <div className="modal-meta">
                  <div className="meta-item"><span className="meta-label">개발자</span><span className="meta-value">{selected.dev}</span></div>
                  <div className="meta-item"><span className="meta-label">출시</span><span className="meta-value">{selected.release}</span></div>
                  <div className="meta-item"><span className="meta-label">기술</span><span className="meta-value">{selected.tech}</span></div>
                  <div className="meta-item"><span className="meta-label">게임 모드</span><span className="meta-value">{selected.mode || selected.players}</span></div>
                </div>
                <div className="modal-divider" aria-hidden="true" />
                {/* <h4 className="modal-section-title">게임 소개</h4> */}
                {selected.highlight && <p className="modal-desc highlight-line">{selected.highlight}</p>}
                {Array.isArray(selected.details) && (
                  <ul className="modal-desc-list">
                    {selected.details.map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                )}
              </div>
              <div className="modal-actions">
                <button
                  className={"start-btn" + (selected.comingSoon ? ' disabled' : '')}
                  disabled={!!selected.comingSoon}
                  onClick={() => { if (!selected.comingSoon) { closeModal(); navigate(selected.to); setcheckgamehome(selected.to); } }}
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