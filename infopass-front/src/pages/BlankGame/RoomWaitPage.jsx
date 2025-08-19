import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BlankGameLobby.css";
import axios from "axios";
import Cookies from "js-cookie";
import { LoginContext } from "../../user/LoginContextProvider";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const socket = new SockJS("http://localhost:9000/ws-game");
const stompClient = Stomp.over(socket);


const API_BASE_URL = "http://localhost:9000";

// Axios 인스턴스 설정
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 모든 요청에 Authorization 헤더를 자동으로 추가하는 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function RoomWaitPage({ onReady }) {
  const { userInfo } = useContext(LoginContext); // 👈 useContext로 userInfo 가져오기
  const [ready, setReady] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = location.state || {}; // userInfo는 useContext로 가져오므로 필요 없음


  useEffect(() => {
  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/room/${roomId}`, (msg) => {
      const data = JSON.parse(msg.body);
      if (data.type === "start") {
        navigate("/blankgame/multi", {
          state: { roomId, quizList: data.quizeList },
        });
      }
    });
  });
}, [roomId,navigate]);


  // 방 정보가 없을 경우 처리
  if (!roomId || !userInfo) {
    return <div>방 정보가 없거나 로그인 정보가 유효하지 않습니다.</div>;
  }

  // 주기적으로 players 정보 갱신
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axiosInstance.get(`/api/rooms/${roomId}/players`);
        setPlayers(res.data);
        console.log("플레이어 목록 갱신:", res.data);
      } catch (error) {
        console.error("플레이어 목록 로딩 실패:", error);
      }
    };

    fetchPlayers(); // 컴포넌트 마운트 시 최초 실행
    const interval = setInterval(fetchPlayers, 2000);

    return () => clearInterval(interval);
  }, [roomId]);

  // 방에 참가 (최초 1회만 실행)
  useEffect(() => {
    const joinRoom = async () => {
      try {
        await axiosInstance.post(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
          userId: userInfo.id,
          nickname: userInfo.nickname,
          ready: false,
        });
        console.log("방 참가 성공");
      } catch (error) {
        console.error("방 참가 실패:", error);
      }
    };

    joinRoom();
  }, [roomId, userInfo.id, userInfo.nickname]);

  // 방 입장 후 내 playerId 찾기
  useEffect(() => {
    const findMyPlayerId = () => {
      const me = players.find((p) => p.userId === userInfo.id);
      if (me) {
        setPlayerId(me.id);
        console.log("내 플레이어 ID:", me.id);
      }
    };
    findMyPlayerId();
  }, [players, userInfo.id]);

  // 준비 버튼 클릭
  const handleReady = async () => {
    setReady(true);
    stompClient.send("/app/ready",{},JSON.stringify({roomId,playerId}));
    if (playerId) {
      try {
        await axiosInstance.post(
          `/api/rooms/player/${playerId}/ready?ready=true`
        );
        console.log("준비 상태 전송 성공");
      } catch (error) {
        console.error("준비 상태 전송 실패:", error);
        setReady(false); // 실패 시 상태 복구
      }
    }
    if (onReady) onReady(userInfo.id);
  };

  // 모든 플레이어가 준비되었는지 확인
  useEffect(() => {
    if (players.length > 0 && players.every((p) => p.ready)) {
      setAllReady(true);
      setTimeout(() => {
        navigate("/blankgame/multi", { state: { roomId } });
      }, 1000);
    }
  }, [players, roomId, navigate]);

  return (
    <div className="wait-bg">
      <div className="wait-container">
        <h2 className="wait-title">게임 대기방</h2>
        <button
          className={`ready-btn${ready ? " ready" : ""}`}
          onClick={handleReady}
          disabled={ready}
        >
          {ready ? "준비 완료!" : "게임 준비 완료"}
        </button>
        <div className="players-list-box">
          <h3 className="players-list-title">참여자 리스트</h3>
          <ul className="players-list">
            {players.map((p) => (
              <li key={p.id} className="players-list-item">
                <span className="player-name">{p.nickname}</span>
                <span className={`player-ready${p.ready ? " on" : ""}`}>
                  {p.ready ? "준비 완료" : "대기중"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {allReady && (
          <div className="all-ready-msg">
            모든 참여자가 준비 완료! 게임 시작...
          </div>
        )}
      </div>
    </div>
  );
}
