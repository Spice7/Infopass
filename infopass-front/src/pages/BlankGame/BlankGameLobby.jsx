import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../user/LoginContextProvider";

import "./BlankGameLobby.css";
import Cookies from "js-cookie";

import { API_ENDPOINTS } from "../../config/api";

const API = API_ENDPOINTS.ROOMS;

export default function BlankGameLobby() {
  const { userInfo } = useContext(LoginContext);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomName: "",
    maxPlayers: 6,
  });
  const navigate = useNavigate();

  // 방 리스트 불러오기
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : data.rooms || []);
      })
      .catch((error) => console.error("방 리스트 불러오기 실패:", error));
  };

  const token = Cookies.get("accessToken");

  // 방 생성 함수
  const createRoom = async () => {
    if (!form.roomName.trim()) return alert("방 이름을 입력하세요");
    if (form.maxPlayers < 2) return alert("최대 인원은 2명 이상이어야 합니다");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, status: "WAITING" }),
      });
      if (!res.ok) {
        throw new Error("방 생성 실패");
      }
      const data = await res.json();
      const roomId = data.roomId;
      // 디버깅: 서버 응답 확인
      console.log("서버 응답 데이터:", data);
      console.log("roomId:", data.roomId);
      console.log("id:", data.id);
      joinRoom(roomId);
      fetchRooms();
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다. 로그인 상태와 권한을 확인하세요.");
    }
  };

  // 방 입장 함수
  const joinRoom = async (roomId) => {
    if (!userInfo || !userInfo.id) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!roomId) {
      alert("방 정보가 올바르지 않습니다.");
      return;
    }
    try {
      await fetch(`${API}/${roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId: userInfo.id }),
      });

      const playersRes = await fetch(`${API}/${roomId}/players`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const playersData = await playersRes.json();

      navigate(`/blankgame/wait/${roomId}`, {
        state: {
          roomId: roomId,
          userInfo: userInfo,
          players: playersData,
        },
      });
    } catch (error) {
      console.error("방 입장 또는 데이터 가져오기 실패:", error);
      alert("방 입장에 실패했습니다.");
    }
  };

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
