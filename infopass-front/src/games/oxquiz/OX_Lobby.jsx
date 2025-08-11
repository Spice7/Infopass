import React, { useEffect, useState, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { LoginContext } from '../../user/LoginContextProvider';
import './OX_Quiz.css';
import axios from 'axios';

const OX_Lobby = () => {
    const { userInfo } = useContext(LoginContext);
    const userId = userInfo?.id;
    const nickname = userInfo?.nickname;

    const [stompClient, setStompClient] = useState(null);
    const [rooms, setRooms] = useState([]);
    const roomsRef = useRef([]);
    useEffect(() => { roomsRef.current = rooms; }, [rooms]);

    const [pendingCreate, setPendingCreate] = useState(false);
    const pendingCreateRef = useRef(false);
    const createdRoomTemp = useRef(null);      // {title,max}

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newMax, setNewMax] = useState(2);

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
            hostId: r.hostId ?? r.host_id ?? r.hostID,
            current: r.current ?? r.playerCount ?? r.count
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

    return (
        <div style={{
            padding: '30px',
            width: '80%',
            margin: '40px auto',
            background: '#142033',
            color: '#fff',
            borderRadius: '18px',
            minHeight: '70vh',
            position: 'relative'
        }}>
            <h2>OX 멀티 로비</h2>
            <div style={{ marginBottom: 12 }}>
                <b>내 닉네임:</b> {nickname || '-'} {myRoom && <> | 현재 방: {myRoom.title}</>}
            </div>

            {!myRoom && (
                <>
                    <div style={{ marginBottom: 10 }}>
                        <button onClick={() => setShowCreate(true)}>방 생성</button>
                        <button style={{ marginLeft: 8 }} onClick={() => {
                            stompClient?.publish({
                                destination: '/app/ox/rooms',
                                body: JSON.stringify({ type: 'list' })
                            });
                        }}>새로고침</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#22344f' }}>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>번호</th>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>방 제목</th>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>방장</th>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>인원</th>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>입장</th>
                                <th style={{ padding: 6, borderBottom: '1px solid #555' }}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: 16, textAlign: 'center', opacity: 0.6 }}>생성된 방이 없습니다.</td>
                                </tr>
                            )}
                            {rooms.map((r, idx) => (
                                <tr key={r.id} style={{ background: '#1d2b42' }}>
                                    <td style={{ padding: 6, textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ padding: 6 }}>{r.title}</td>
                                    <td style={{ padding: 6 }}>{r.hostNick}</td>
                                    <td style={{ padding: 6, textAlign: 'center' }}>{r.current}/{r.max}</td>
                                    <td style={{ padding: 6, textAlign: 'center' }}>
                                        <button
                                            disabled={r.current >= r.max}
                                            onClick={() => handleJoin(r.id)}
                                        >입장</button>
                                    </td>
                                    <td style={{ padding: 6, textAlign: 'center' }}>
                                        {r.current >= r.max ? '마감' : '대기중'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {myRoom && (
                <div style={{
                    marginTop: 20,
                    padding: 16,
                    background: '#1e304b',
                    borderRadius: 12
                }}>
                    <h3 style={{ marginTop: 0 }}>{myRoom.title} (ID: {myRoom.id})</h3>
                    <div style={{ marginBottom: 10 }}>
                        방장: {myRoom.hostNick} | 인원: {players.length}/{myRoom.max}
                    </div>
                    <div style={{
                        display: 'flex', gap: 12, flexWrap: 'wrap',
                        marginBottom: 14
                    }}>
                        {players.map(p => (
                            <div key={p.userId} style={{
                                padding: '10px 14px',
                                background: p.isHost ? '#385d9c' : '#2d476d',
                                borderRadius: 10,
                                minWidth: 120
                            }}>
                                {p.nickname}{p.isHost ? ' (방장)' : ''}
                            </div>
                        ))}
                    </div>
                    <div>
                        {isHost && (
                            <button
                                onClick={handleStart}
                                disabled={!(isHost && myRoom && players.length === myRoom.max)}
                                style={{ marginRight: 8 }}
                            >게임 시작</button>
                        )}
                        <button onClick={handleLeave}>방 나가기</button>
                    </div>
                </div>
            )}

            {showCreate && (
                <div style={{
                    position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.55)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 99
                }}>
                    <div style={{
                        width: 340, background: '#203147', padding: 24,
                        borderRadius: 14, boxShadow: '0 4px 18px rgba(0,0,0,0.4)'
                    }}>
                        <h4 style={{ marginTop: 0 }}>방 생성</h4>
                        <div style={{ marginBottom: 10 }}>
                            <label>방 제목</label><br />
                            <input
                                style={{ width: '100%', padding: '8px 6px', borderRadius: 6, border: 'none' }}
                                type="text"
                                value={newTitle}
                                maxLength={20}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label>최대 인원 (2~4)</label><br />
                            <select
                                style={{ width: '100%', padding: '8px 6px', borderRadius: 6, border: 'none' }}
                                value={newMax}
                                onChange={e => setNewMax(+e.target.value)}
                            >
                                {[2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button onClick={() => setShowCreate(false)} style={{ marginRight: 8 }}>취소</button>
                            <button onClick={handleCreate}>생성</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OX_Lobby;
