import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../../user/LoginContextProvider";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
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
  const [stompClient, setStompClient] = useState(null);
  const navigate = useNavigate();

  // 방 리스트 불러오기
  useEffect(() => {
    fetchRooms();

    // 주기적으로 방 리스트 업데이트 (30초마다)
    const interval = setInterval(() => {
      fetchRooms();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket 연결 및 실시간 업데이트
  useEffect(() => {
    if (!userInfo?.id) return;

    console.log("🔌 로비 WebSocket 연결 시도");

    // STOMP 클라이언트 생성
    const client = Stomp.over(
      () => new SockJS("http://localhost:9000/ws-game")
    );

    client.debug = (str) => {
      console.log("Lobby STOMP: " + str);
    };

    const connectHeaders = {};
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      connectHeaders.Authorization = `Bearer ${accessToken}`;
    }

    client.connect(
      connectHeaders,
      (frame) => {
        console.log("✅ 로비 WebSocket 연결 성공:", frame);
        setStompClient(client);

        // 로비 업데이트 구독 (모든 방의 변경사항)
        const lobbySubscription = client.subscribe(
          "/topic/lobby",
          (message) => {
            try {
              console.log("📨 로비 업데이트 메시지:", message.body);
              const updateData = JSON.parse(message.body);

              // 방 리스트 전체 업데이트
              if (updateData.type === "ROOM_LIST_UPDATE") {
                console.log("🔄 방 리스트 실시간 업데이트");
                fetchRooms();
              }
              // 특정 방의 참여자 수 변경
              else if (updateData.type === "ROOM_PLAYER_COUNT_UPDATE") {
                const { roomId, currentPlayers } = updateData;
                console.log(
                  `🔄 방 ${roomId} 참여자 수 업데이트: ${currentPlayers}명`
                );

                setRooms((prevRooms) =>
                  prevRooms.map((room) =>
                    room.id === roomId
                      ? { ...room, currentPlayers: currentPlayers }
                      : room
                  )
                );
              }
            } catch (error) {
              console.error("❌ 로비 메시지 파싱 에러:", error);
            }
          },
          { id: `lobby-${userInfo.id}` }
        );

        client.lobbySubscription = lobbySubscription;
      },
      (error) => {
        console.error("❌ 로비 WebSocket 연결 실패:", error);
      }
    );

    // cleanup
    return () => {
      if (client && client.connected) {
        console.log("🔌 로비 WebSocket 연결 해제");
        try {
          if (client.lobbySubscription) {
            client.lobbySubscription.unsubscribe();
          }
          client.disconnect();
        } catch (error) {
          console.error("로비 WebSocket 해제 중 오류:", error);
        }
      }
    };
  }, [userInfo?.id]);

  const fetchRooms = () => {
    console.log("🔄 방 리스트 조회 시작");
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        console.log("📨 방 리스트 데이터:", data);
        setRooms(Array.isArray(data) ? data : data.rooms || []);
      })
      .catch((error) => {
        console.error("방 리스트 불러오기 실패:", error);
        setRooms([]);
      });
  };

  const token = Cookies.get("accessToken");

  // 방 생성 함수 - WebSocket 알림 추가
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

      console.log("✅ 방 생성 완료:", data);

      // 방 생성 후 로비에 알림 (WebSocket으로 실시간 업데이트)
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/lobby/update",
          body: JSON.stringify({
            type: "ROOM_CREATED",
            roomId: roomId,
            userId: userInfo.id,
          }),
        });
      }

      // 폼 초기화
      setForm({ roomName: "", maxPlayers: 6 });

      // 방 입장
      joinRoom(roomId);
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
      console.log(`🚪 방 ${roomId} 입장 시도`);

      const joinRes = await fetch(`${API}/${roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId: userInfo.id }),
      });

      if (!joinRes.ok) {
        const errorText = await joinRes.text();
        throw new Error(`방 입장 실패: ${errorText}`);
      }

      const playersRes = await fetch(`${API}/${roomId}/players`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!playersRes.ok) {
        throw new Error("플레이어 목록 조회 실패");
      }

      const playersData = await playersRes.json();
      console.log("✅ 방 입장 성공, 플레이어 목록:", playersData);

      navigate(`/blankgame/wait/${roomId}`, {
        state: {
          roomId: roomId,
          userInfo: userInfo,
          players: playersData,
        },
      });
    } catch (error) {
      console.error("방 입장 실패:", error);
      alert(`방 입장에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <div className="lobby-bg">
      <div className="lobby-container">
        <h2 className="lobby-title">멀티게임</h2>

    

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="room-list-title">방 리스트</h3>
            <button
              onClick={fetchRooms}
              style={{
                padding: "5px 10px",
                fontSize: "12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                
              }}
            >
              🔄 새로고침
            </button>
          </div>

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
                      <span
                        style={{
                          color:
                            room.currentPlayers >= room.maxPlayers
                              ? "#dc3545"
                              : "#28a745",
                          fontWeight: "bold",
                        }}
                      >
                        {room.currentPlayers || 0}
                      </span>
                      <span style={{ color: "#6c757d" }}>
                        {" / " + (room.maxPlayers || "?")}명
                      </span>
                    </span>
                  </div>
                  <button
                    className="room-join-btn"
                    onClick={() => joinRoom(room.id)}
                    disabled={room.currentPlayers >= room.maxPlayers}
                    style={{
                      backgroundColor:
                        room.currentPlayers >= room.maxPlayers ? "#6c757d" : "",
                      cursor:
                        room.currentPlayers >= room.maxPlayers
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {room.currentPlayers >= room.maxPlayers ? "만료" : "입장"}
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
