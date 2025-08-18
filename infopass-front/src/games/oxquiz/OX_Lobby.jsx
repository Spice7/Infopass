import React, { useEffect, useState, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { LoginContext } from '../../user/LoginContextProvider';
import './OX_Quiz.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ========================================
// 🧩 파일 개요 (멀티 로비)
// - STOMP 연결로 방 목록 수신/생성/입장/시작/퇴장 관리
// - 내 정보/방 카드/모달 UI로 UX 구성
// - 방 생성 시 DB 저장(REST), 이벤트는 STOMP로 브로드캐스트
// ========================================

// 재사용 가능한 모달 컴포넌트
function Modal({ open, children }) {
    return open ? (
        <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(20,30,50,0.75)',
            backdropFilter: 'blur(2.5px)',
            zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s',
        }}>
            <div style={{
                minWidth: 400, maxWidth: 520, width: '90vw',
                background: 'linear-gradient(135deg, #22344f 60%, #2b4170 100%)',
                borderRadius: 22,
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                padding: '38px 36px 28px 36px',
                position: 'relative',
                animation: 'modalPop 0.35s',
            }}>
                {children}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalPop { 0% { transform: scale(0.85); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    ) : null;
}

const OX_Lobby = () => {
    // ===== 상태/컨텍스트 그룹 =====
    const { userInfo } = useContext(LoginContext);
    const userId = userInfo?.id;
    const nickname = userInfo?.nickname;
    const navigate = useNavigate(); 

    // STOMP 클라이언트/방 리스트/진행 상태
    const [stompClient, setStompClient] = useState(null);
    const [rooms, setRooms] = useState([]);
    const roomsRef = useRef([]);
    useEffect(() => { roomsRef.current = rooms; }, [rooms]);

    // 방 생성 대기/임시 상태
    const [pendingCreate, setPendingCreate] = useState(false);
    const pendingCreateRef = useRef(false);
    const createdRoomTemp = useRef(null);      // {title,max}

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newMax, setNewMax] = useState(2);

    // 내가 참여한 방/플레이어/권한
    const [myRoom, setMyRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);

    //url
    const createoxlobby = 'http://localhost:9000/lobby/ox';

    const roomSubRef = useRef(null);
    useEffect(() => { pendingCreateRef.current = pendingCreate; }, [pendingCreate]);

    // 방 목록 처리 + 자동입장
    const processRoomList = (rawList) => {
        const list = (rawList || []).map(r => ({
            ...r,
            hostId: r.hostId ?? r.host_user_id ?? r.host_id ?? r.hostID,
            current: r.current ?? r.playerCount ?? r.count ?? 0
        }));
        setRooms(list);

        if (pendingCreateRef.current && userId) {
            let mine = list.filter(r => r.hostId && String(r.hostId) === String(userId));
            if (mine.length === 0 && createdRoomTemp.current) {
                mine = list.filter(r =>
                    !r.hostId &&
                    r.hostNick === nickname &&
                    r.title === createdRoomTemp.current.title
                );
            }
            if (mine.length > 0) {
                const target = mine.reduce((a, b) => (+a.id > +b.id ? a : b));
                if (!myRoom || myRoom.id !== target.id) {
                    handleJoin(target.id);
                }
                setPendingCreate(false);
                pendingCreateRef.current = false;
                createdRoomTemp.current = null;
            } else if (!myRoom && createdRoomTemp.current) {
                // 낙관적 표시 (브로드캐스트 지연 대비)
                setMyRoom({
                    id: 'pending',
                    title: createdRoomTemp.current.title,
                    hostId: userId,
                    hostNick: nickname,
                    max: createdRoomTemp.current.max
                });
                setPlayers([{ userId, nickname, isHost: true }]);
                setIsHost(true);
            }
        }
    };

    // STOMP 연결
    useEffect(() => {
        const socket = new SockJS('http://localhost:9000/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 4000,
            debug: s => console.log('[STOMP]', s)
        });

        client.onConnect = () => {
            client.subscribe('/topic/ox/lobby', msg => {
                const data = JSON.parse(msg.body);
                if (data.type === 'rooms') processRoomList(data.rooms || []);
            });

            // created 이벤트(백엔드에서 보낸다면 즉시 처리)
            client.subscribe('/topic/ox/created', msg => {
                const data = JSON.parse(msg.body);
                if (data.type === 'created' && String(data.hostId) === String(userId)) {
                    handleJoin(data.roomId);
                    setPendingCreate(false);
                    pendingCreateRef.current = false;
                }
            });

            client.publish({
                destination: '/app/ox/rooms',
                body: JSON.stringify({ type: 'list' })
            });
        };

        client.activate();
        setStompClient(client);
        return () => client.deactivate();
    }, [userId, nickname]);

    // 특정 방 구독
    const subscribeRoom = (roomId) => {
        if (!stompClient || !roomId || roomId === 'pending') return;
        if (roomSubRef.current) {
            roomSubRef.current.unsubscribe();
            roomSubRef.current = null;
        }
        roomSubRef.current = stompClient.subscribe(`/topic/ox/room.${roomId}`, msg => {
            const data = JSON.parse(msg.body);
            if (data.type === 'room') {
                setMyRoom(data.room);
                setPlayers(data.players || []);
                setIsHost(String(data.room?.hostId) === String(userId));
            }
            if (data.type === 'start') {
                window.location.href = `OX_MultiGame?roomId=${data.roomId}`;
            }
        });
    };

    // 방 생성
    const handleCreate = () => {
        if (!stompClient || !nickname) return;
        if (!newTitle.trim()) { alert('방 제목을 입력하세요'); return; }

        const titleTrim = newTitle.trim();
        createdRoomTemp.current = { title: titleTrim, max: newMax };

        stompClient.publish({
            destination: '/app/ox/room.create',
            body: JSON.stringify({
                type: 'create',
                title: titleTrim,
                max: newMax,
                hostId: userId,
                hostNick: nickname
            })
        });

        setShowCreate(false);
        setNewTitle('');
        setNewMax(2);
        setPendingCreate(true);
        pendingCreateRef.current = true;

        // 생성한 방 DB에 저장
        axios.post(createoxlobby, {
            host_user_id: userInfo?.id,
            game_type: 'OxQuiz',
            status: 'WAITING',
            max_players: newMax
        }).then(res => {
            console.log('방 생성 성공:', res.data);
        })
            .catch(err => {
                console.log('호스트ID:', userInfo?.id);
                console.log('게임 타입:', 'OxQuiz');
                console.log('최대 플레이어 수:', newMax);
                console.error('방 생성 실패:', err);
            });

        // 목록 재요청 (지연 대비)
        setTimeout(() => {
            if (stompClient.connected)
                stompClient.publish({
                    destination: '/app/ox/rooms',
                    body: JSON.stringify({ type: 'list' })
                });
        }, 250);

        // 추가 강제 탐색 (최대 5회 / 700ms 간격)
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                if (!pendingCreateRef.current) return;
                if (myRoom && myRoom.id !== 'pending') return;
                const list = roomsRef.current;
                let mine = list.filter(r => r.hostId && String(r.hostId) === String(userId));
                if (mine.length === 0) {
                    mine = list.filter(r =>
                        !r.hostId &&
                        r.hostNick === nickname &&
                        r.title === titleTrim
                    );
                }
                if (mine.length > 0) {
                    const target = mine.reduce((a, b) => (+a.id > +b.id ? a : b));
                    handleJoin(target.id);
                    setPendingCreate(false);
                    pendingCreateRef.current = false;
                    createdRoomTemp.current = null;
                }
            }, 700 * i);
        }
    };

    // 방 입장
    const handleJoin = (roomId) => {
        if (!stompClient || !roomId || roomId === 'pending') return;
        subscribeRoom(roomId);
        stompClient.publish({
            destination: '/app/ox/room.join',
            body: JSON.stringify({
                type: 'join',
                roomId,
                userId,
                nickname
            })
        });
        // 첫 메시지 놓침 대비
        setTimeout(() => {
            if (!myRoom || String(myRoom.id) !== String(roomId)) {
                if (stompClient.connected) {
                    stompClient.publish({
                        destination: '/app/ox/room.info',
                        body: JSON.stringify({ type: 'info', roomId })
                    });
                }
            }
        }, 300);
    };

    // 게임 시작 (정원 꽉 찼을 때만)
    const handleStart = () => {
        if (!stompClient || !myRoom) return;
        if (players.length !== myRoom.max) {
            alert('정원이 꽉 찼을 때만 시작 가능합니다.');
            return;
        }
        stompClient.publish({
            destination: '/app/ox/room.start',
            body: JSON.stringify({
                type: 'start',
                roomId: myRoom.id,
                userId
            })
        });
    };

    // 나가기
    const handleLeave = () => {
        if (!stompClient || !myRoom) return;
        stompClient.publish({
            destination: '/app/ox/room.leave',
            body: JSON.stringify({
                type: 'leave',
                roomId: myRoom.id,
                userId
            })
        });
        if (roomSubRef.current) {
            roomSubRef.current.unsubscribe();
            roomSubRef.current = null;
        }
        setMyRoom(null);
        setPlayers([]);
        setIsHost(false);
    };
    
    // 방 갯수 계산
    const totalRooms = rooms.length;

    return (
        <div style={{
            width: '70vw',
            maxWidth: '1200px',
            height: '70vh',
            minWidth: '620px',
            minHeight: '420px',
            background: 'linear-gradient(135deg, #1e2a47 0%, #233a5e 100%)',
            borderRadius: '40px',
            boxShadow: '0 18px 46px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset',
            margin: '140px auto 80px',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            fontFamily: 'Pretendard, Noto Sans KR, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* 상단 타이틀 영역 */}
            <div style={{
                width: '100%',
                background: 'linear-gradient(90deg, #2b4170 60%, #3a5ba0 100%)',
                padding: '44px 0 30px 0',
                textAlign: 'center',
                boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* 빛 효과 */}
                <div style={{
                    position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)',
                    width: 400, height: 120, 
                    zIndex: 0,
                }} />
                {/* 로고 */}
                {/* <img src="/oxgame_logo.png" alt="OX퀴즈" style={{ height: 60, marginBottom: 8 }} /> */}
                <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: 2, margin: 0, color: '#ffe066', textShadow: '2px 2px 12px #22344f', zIndex: 1, position: 'relative' }}>OX 멀티 로비</h1>
                <div style={{ fontSize: 18, color: '#c7e0ff', marginTop: 10, zIndex: 1, position: 'relative' }}>친구들과 함께 OX 퀴즈를 즐겨보세요!</div>
            </div>

            {/* 내 정보/현재 방 카드 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 10,
                marginBottom: 10,
                zIndex: 2,
                position: 'relative',
            }}>
                <div style={{
                    background: 'linear-gradient(90deg, #22344f 60%, #2b4170 100%)',
                    borderRadius: 18,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                    padding: '18px 32px',
                    minWidth: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 32,
                    fontSize: 18,
                    fontWeight: 600,
                }}>
                    <span style={{ color: '#ffe066', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span role="img" aria-label="user">👤</span> 유저명 : <b style={{ color: '#fff', fontWeight: 700 }}>{nickname || '-'}</b>
                    </span>
                    <span style={{ color: '#7fd8ff', marginLeft: 300 }}>
                        방 갯수 : <b style={{ color: '#fff', fontWeight: 700 }}>{totalRooms}</b> 개
                    </span>
                </div>
            </div>

            {/* 방 목록/방 생성/새로고침/뒤로가기 */}
            {!myRoom && (
                <div style={{
                    maxWidth: 800,
                    margin: '0 auto',
                    background: 'rgba(34,52,79,0.92)',
                    borderRadius: 18,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
                    padding: '32px 28px 24px 28px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                        <button onClick={() => setShowCreate(true)} style={btnStyle('main')}>+ 방 생성</button>
                        <div>
                            <button style={btnStyle('sub')} onClick={() => {
                                stompClient?.publish({
                                    destination: '/app/ox/rooms',
                                    body: JSON.stringify({ type: 'list' })
                                });
                            }}>새로고침</button>
                            <button style={btnStyle('sub', { marginLeft: 8 })} onClick={() => navigate('/oxquiz/OX_main')}>뒤로가기</button>
                        </div>
                    </div>
                    {/* 방 목록 카드형 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent:'center'}}>
                        {rooms.length === 0 && (
                            <div style={{ padding: 32, opacity: 0.7, fontSize: 18, color: '#b0c4de', background: '#1d2b42', borderRadius: 14, minWidth: 320, textAlign: 'center' }}>
                                생성된 방이 없습니다.
                            </div>
                        )}
                        {rooms.map((r, idx) => (
                            <div key={r.id} style={{
                                background: 'linear-gradient(135deg, #1d2b42 60%, #2b4170 100%)',
                                borderRadius: 14,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                                padding: '18px 22px',
                                minWidth: 220,
                                maxWidth: 260,
                                flex: '1 0 220px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                border: r.current >= r.max ? '2px solid #ff7675' : '2px solid #7fd8ff',
                                opacity: r.current >= r.max ? 0.7 : 1,
                                position: 'relative',
                                transition: 'transform 0.15s',
                                cursor: r.current < r.max ? 'pointer' : 'not-allowed',
                            }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ fontWeight: 700, fontSize: 18, color: '#ffe066', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span role="img" aria-label="room">🏠</span>{idx+1}. {r.title}
                                </div>
                                <div style={{ fontSize: 14, color: '#b0c4de' }}>방장: <b style={{ color: '#7fd8ff' }}>{r.hostNick}</b></div>
                                <div style={{ fontSize: 14 }}>인원: <b>{r.current}/{r.max}</b></div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button
                                        disabled={r.current >= r.max}
                                        onClick={() => handleJoin(r.id)}
                                        style={btnStyle(r.current >= r.max ? 'disabled' : 'main')}
                                    >{r.current >= r.max ? '마감' : '입장'}</button>
                                </div>
                                {r.current >= r.max && <span style={{ position: 'absolute', top: 10, right: 16, color: '#ff7675', fontWeight: 700, fontSize: 13 }}>마감</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 내가 입장한 방 - 모달로 표시 */}
            <Modal open={!!myRoom}>
                {myRoom && (
                    <div>
                        <h2 style={{ marginTop: 0, color: '#ffe066', fontWeight: 800, fontSize: 28, textAlign: 'center', letterSpacing: 1 }}>{myRoom.title} <span style={{ color: '#7fd8ff', fontSize: 16, fontWeight: 500 }}>(ID: {myRoom.id})</span></h2>
                        <div style={{ marginBottom: 10, color: '#b0c4de', fontWeight: 500, textAlign: 'center' }}>
                            방장: <span style={{ color: '#7fd8ff' }}>{myRoom.hostNick}</span> | 인원: <span style={{ color: '#fff' }}>{players.length}/{myRoom.max}</span>
                        </div>
                        <div style={{
                            display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18, justifyContent: 'center',
                        }}>
                            {players.map(p => (
                                <div key={p.userId} style={{
                                    padding: '10px 14px',
                                    background: p.isHost ? '#385d9c' : '#2d476d',
                                    borderRadius: 10,
                                    minWidth: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontWeight: 600,
                                    color: '#fff',
                                    boxShadow: p.isHost ? '0 0 8px #ffe066' : 'none',
                                }}>
                                    <span role="img" aria-label="user">{p.isHost ? '👑' : '🧑'}</span>
                                    {p.nickname}{p.isHost ? ' (방장)' : ''}
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            {isHost && (
                                <button
                                    onClick={handleStart}
                                    disabled={!(isHost && myRoom && players.length === myRoom.max)}
                                    style={btnStyle(!(isHost && myRoom && players.length === myRoom.max) ? 'disabled' : 'main', { marginRight: 8 })}
                                >게임 시작</button>
                            )}
                            <button onClick={handleLeave} style={btnStyle('sub')}>방 나가기</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 방 생성 모달 */}
            {showCreate && (
                <Modal open={showCreate}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <h2 style={{ marginTop: 0, color: '#ffe066', fontWeight: 800, fontSize: 22, textAlign: 'center' }}>방 생성</h2>
                        <div>
                            <label style={{ fontWeight: 600, color: '#b0c4de' }}>방 제목</label><br />
                            <input
                                style={{ width: '100%', padding: '10px 8px', borderRadius: 8, border: 'none', fontSize: 16, marginTop: 4, background: '#1d2b42', color: '#fff' }}
                                type="text"
                                value={newTitle}
                                maxLength={20}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="방 제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, color: '#b0c4de' }}>최대 인원 (2~4)</label><br />
                            <select
                                style={{ width: '100%', padding: '10px 8px', borderRadius: 8, border: 'none', fontSize: 16, marginTop: 4, background: '#1d2b42', color: '#fff' }}
                                value={newMax}
                                onChange={e => setNewMax(+e.target.value)}
                            >
                                {[2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: 8 }}>
                            <button onClick={() => setShowCreate(false)} style={btnStyle('sub', { marginRight: 8 })}>취소</button>
                            <button onClick={handleCreate} style={btnStyle('main')}>생성</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// 버튼 스타일 함수 추가
function btnStyle(type, extra = {}) {
    let base = {
        padding: '8px 18px',
        borderRadius: 8,
        border: 'none',
        fontWeight: 700,
        fontSize: 16,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        transition: 'background 0.15s, color 0.15s, opacity 0.15s',
        outline: 'none',
        ...extra,
    };
    if (type === 'main') return {
        ...base,
        background: 'linear-gradient(90deg, #7fd8ff 0%, #3a5ba0 100%)',
        color: '#22344f',
    };
    if (type === 'sub') return {
        ...base,
        background: '#22344f',
        color: '#fff',
        border: '1.5px solid #7fd8ff',
    };
    if (type === 'disabled') return {
        ...base,
        background: '#888',
        color: '#eee',
        cursor: 'not-allowed',
        opacity: 0.7,
    };
    return base;
}

export default OX_Lobby;
