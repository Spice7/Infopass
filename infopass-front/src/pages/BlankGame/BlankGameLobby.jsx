// src/GameLobby.jsx
import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import RoomWaitPage from "./RoomWaitPage";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../user/LoginContextProvider";

import "./BlankGameLobby.css";
import Cookies from "js-cookie";

const WS_URL = "http://localhost:9000/ws-game";
const API = "http://localhost:9000/api/rooms";

export default function BlankGameLobby() {
  const { userInfo } = useContext(LoginContext);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomName: "",
    maxPlayers: 6,
  });
  const [enterRoomId, setEnterRoomId] = useState(null);
  const [waitPlayers, setWaitPlayers] = useState([]);
  const navigate = useNavigate();

  // 방 리스트 불러오기 (예시 API)
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : data.rooms || []);
      });
  }, []);

  const token = Cookies.get("accessToken");

  // 방 생성 함수
  const createRoom = async () => {
    if (!form.roomName.trim()) return alert("방 이름을 입력하세요");
    if (form.maxPlayers < 2) return alert("최대 인원은 2명 이상이어야 합니다");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, status: "WAITING" }), // status 추가
    });
    if (!res.ok) {
      alert("방 생성에 실패했습니다. 로그인 상태와 권한을 확인하세요.");
      return;
    }
    const data = await res.json();
    const roomId = data.roomId;
    joinRoom(roomId);

    // 방 리스트 갱신
    fetch(API)
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : data.rooms || []));
  };

  useEffect(() => {
    console.log("userInfo:", userInfo);
  }, [userInfo]);

  // 방 입장 함수
  const joinRoom = async (roomId) => {
    // userInfo가 유효한지 먼저 확인합니다.
    if (!userInfo || !userInfo.id) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!roomId) {
      alert("방 정보가 올바르지 않습니다.");
      return;
    }
    await fetch(`${API}/${roomId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ userId: userInfo.id }),
    });
    setEnterRoomId(roomId);

    fetch(`${API}/${roomId}/players`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // 1. setWaitPlayers를 호출하여 상태 업데이트
        setWaitPlayers(data);
        // 2. navigate를 호출하여 라우팅
        // 이 때, 최신 데이터를 직접 전달
        navigate(`/blankgame/wait/${roomId}`, {
          state: {
            roomId,
            userInfo,
            players: data, // fetch로 받아온 최신 데이터를 직접 전달
          },
        });
      });
  };

  // 준비 완료 처리
  const handleReady = async (userId) => {
    // 본인 playerId 찾기
    const player = waitPlayers.find((p) => p.userId === userId);
    if (!player) return;
    await fetch(`${API}/player/${player.id}/ready?ready=true`, {
      method: "POST",
    });
    // 참여자 리스트 갱신
    fetch(`${API}/${enterRoomId}/players`)
      .then((res) => res.json())
      .then((data) => setWaitPlayers(data));
  };

  // RoomWaitPage로 이동
  if (enterRoomId) {
    return (
      <RoomWaitPage
        roomId={enterRoomId}
        userInfo={userInfo}
        players={waitPlayers}
        onReady={handleReady}
      />
    );
  }

  return (
    <div className="lobby-bg">
      <div className="lobby-container">
        <h2 className="lobby-title">멀티게임 로비</h2>
        <div className="room-create-box">
          <input
            className="room-input"
            type="text"
            placeholder="방 이름을 입력하세요"
            value={form.roomName}
            onChange={(e) => setForm({ ...form, roomName: e.target.value })}
          />
          <input
            className="room-input"
            type="number"
            min={2}
            max={20}
            placeholder="최대 인원"
            value={form.maxPlayers}
            onChange={(e) => setForm({ ...form, maxPlayers: +e.target.value })}
          />
          <button className="room-create-btn" onClick={createRoom}>
            방 생성
          </button>
        </div>
        <div className="room-list-box">
          <h3 className="room-list-title">방 리스트</h3>
          <ul className="room-list">
            {rooms.length === 0 && (
              <li className="room-list-empty">현재 생성된 방이 없습니다.</li>
            )}
            {rooms.map((room) =>
              room && room.id ? (
                <li key={room.id} className="room-list-item">
                  <div className="room-info">
                    <span className="room-name">
                      {room.roomName || "이름없음"}
                    </span>
                    <span className="room-players">
                      {room.currentPlayers || 0} / {room.maxPlayers || "?"}명
                    </span>
                  </div>
                  <button
                    className="room-join-btn"
                    onClick={() => joinRoom(room.id)}
                  >
                    입장
                  </button>
                </li>
              ) : null
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
