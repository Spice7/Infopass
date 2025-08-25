import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoginContext } from "../../user/LoginContextProvider";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import "./BlankGameLobby.css"; // CSS 파일은 로비와 공유될 수 있음

const WS_URL = "http://localhost:9000/ws-game";
const API = "http://localhost:9000/api/rooms";

export default function RoomWaitPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { roomId } = useParams();
  const { userInfo } = useContext(LoginContext);

  // useLocation의 state 또는 useParams에서 roomId를 가져옵니다.
  const currentRoomId = state?.roomId || roomId;
  const initialPlayers = state?.players || [];

  const [players, setPlayers] = useState(initialPlayers);
  const [stompClient, setStompClient] = useState(null);

  // 초기 데이터 로딩 및 유효성 검사
  useEffect(() => {
    if (!currentRoomId) {
      console.log("Room Id가 없습니다. 방 목록으로 돌아갑니다.");
      navigate("/blankgamelobby");
      return;
    }

    // 라우터 state에 players 데이터가 없으면 API 호출
    if (!initialPlayers || initialPlayers.length === 0) {
      fetch(`${API}/${currentRoomId}/players`, {
        headers: {
          Authorization: userInfo?.accessToken
            ? `Bearer ${userInfo.accessToken}`
            : "",
        },
      })
        .then((res) => res.json())
        .then((data) => setPlayers(data))
        .catch((error) => {
          console.error("플레이어 데이터 가져오기 실패:", error);
          navigate("/blankgamelobby");
        });
    }
  }, [currentRoomId, navigate, initialPlayers, userInfo]);

  // WebSocket 연결 로직
  useEffect(() => {
    if (!currentRoomId) return;

    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        setStompClient(client);

        // 방 플레이어 정보 업데이트 구독
        client.subscribe(`/topic/room/${currentRoomId}`, (message) => {
          const updatedPlayers = JSON.parse(message.body);
          setPlayers(updatedPlayers);
        });
        // 게임 시작 메시지 구독 (새로운 로직 추가)
        client.subscribe(`/topic/game/start/${currentRoomId}`, (message) => {
          const quizList = JSON.parse(message.body);
          console.log("게임 시작 메시지 수신, 퀴즈 데이터:", quizList);
          // 게임 페이지로 이동하면서 퀴즈 데이터를 state로 전달
          navigate("/blankgamemulti", {
            state: { roomId: currentRoomId, quizList: quizList },
          });
        });
      },
      (error) => {
        console.error("웹소켓 연결 실패:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect();
      }
    };
  }, [currentRoomId, navigate]);

  // 준비 완료 버튼 핸들러 (웹소켓 사용)
  const handleReady = () => {
    if (!stompClient || !stompClient.connected) {
      alert("웹소켓 연결이 불안정합니다.");
      return;
    }

    // 디버깅용 console.log 추가
    console.log("현재 플레이어 목록:", players);
    console.log("로그인한 사용자 정보:", userInfo);

    const player = players.find((p) => p.userId === Number(userInfo?.id));
    console.log("찾은 플레이어 정보:", player);

    if (!player) {
      alert("플레이어 정보를 찾을 수 없습니다.");
      return;
    }

    const payload = {
      playerId: parseInt(player.id, 10),
      ready: true,
    };

    stompClient.send("/app/ready", {}, JSON.stringify(payload));
  };

  // UI 렌더링
  return (
    <div className="room-wait-page">
      <h2>방 {currentRoomId} 대기 중</h2>
      <ul className="player-list">
        {players.map((player) => (
          <li key={player.id}>
            {player.nickname} {player.ready ? "🟢" : "🔴"}
          </li>
        ))}
      </ul>
      <button onClick={handleReady}>준비</button>
      <button onClick={() => navigate("/blankgamelobby")}>나가기</button>
    </div>
  );
}
