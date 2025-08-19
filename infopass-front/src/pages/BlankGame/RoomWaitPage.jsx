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
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function RoomWaitPage() {
  const { userInfo } = useContext(LoginContext);
  const [ready, setReady] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = location.state || {};

  useEffect(() => {
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/room/${roomId}`, (msg) => {
        const data = JSON.parse(msg.body);
        if (data.type === "start") {
          // 소켓으로 게임 시작 신호가 오면 quizList와 함께 이동
          navigate("/blankgame/multi", {
            state: { roomId, quizList: data.quizList },
          });
        }
      });
    });
  }, [roomId, navigate]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axiosInstance.get(`/api/rooms/${roomId}/players`);
        setPlayers(res.data);
      } catch (error) {
        console.error("플레이어 목록 로딩 실패:", error);
      }
    };
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    let joined = false;
    const joinRoom = async () => {
      if (joined) return;
      joined = true;
      try {
        await axiosInstance.post(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
          userId: userInfo.id,
          nickname: userInfo.nickname,
          ready: false,
        });
      } catch (error) {
        console.error("방 참가 실패:", error);
      }
    };
    // userInfo.id, nickname, roomId가 모두 존재할 때만 1회 실행
    if (userInfo.id && userInfo.nickname && roomId) {
      joinRoom();
    }
    // 빈 배열로 설정 (최초 마운트 1회만 실행)
  }, []);

  useEffect(() => {
    const me = players.find((p) => p.userId === userInfo.id);
    if (me) setPlayerId(me.id);
  }, [players, userInfo.id]);

  // 준비 버튼 클릭
  const handleReady = async () => {
    setReady(true);
    stompClient.send("/app/ready", {}, JSON.stringify({ roomId, playerId }));
    if (playerId) {
      try {
        await axiosInstance.post(
          `/api/rooms/player/${playerId}/ready?ready=true`
        );
      } catch (error) {
        setReady(false);
      }
    }
  };

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
      </div>
    </div>
  );
}
