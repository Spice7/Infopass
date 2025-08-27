import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoginContext } from "../../user/LoginContextProvider";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import Cookies from "js-cookie";
import "./BlankGameLobby.css"; // CSS 파일은 로비와 공유될 수 있음
import axios from "axios";

import { API_BASE_URL } from "../../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
  const navigate = useNavigate();
  const { state } = useLocation();
  const { roomId: paramRoomId } = useParams();
  const { userInfo } = useContext(LoginContext);

  // roomId 결정: state > params 순으로 우선순위
  const currentRoomId = state?.roomId || paramRoomId;

  const [players, setPlayers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const [currentPlayer, setCurrentPlayer] = useState(null);

  // 유효성 검사
  useEffect(() => {
    console.log("RoomWaitPage 마운트:", { currentRoomId, userInfo });

    if (!currentRoomId) {
      console.error("Room ID가 없습니다.");
      navigate("/blankgamelobby");
      return;
    }

    if (!userInfo?.id) {
      console.error("사용자 정보가 없습니다.");
      navigate("/login");
      return;
    }
  }, [currentRoomId, userInfo, navigate]);

  // 플레이어 목록 가져오기
  const fetchPlayers = async () => {
    if (!currentRoomId) return;

    try {
      console.log("플레이어 목록 가져오기 시도:", currentRoomId);
      const response = await axiosInstance.get(
        `/api/rooms/${currentRoomId}/players`
      );
      console.log("플레이어 목록 응답:", response.data);
      setPlayers(response.data);

      // 현재 사용자 찾기
      const me = response.data.find((p) => p.userId === userInfo.id);
      setCurrentPlayer(me);
    } catch (error) {
      console.error("플레이어 목록 가져오기 실패:", error);
      if (error.response?.status === 404) {
        alert("방을 찾을 수 없습니다.");
        navigate("/blankgamelobby");
      }
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    if (currentRoomId && userInfo?.id) {
      fetchPlayers();
    }
  }, [currentRoomId, userInfo]);

  // 방 참가
  const joinRoom = async () => {
    if (!currentRoomId || !userInfo?.id) return;

    try {
      console.log("방 참가 시도:", { roomId: currentRoomId, userInfo });
      await axiosInstance.post(`/api/rooms/${currentRoomId}/join`);
      console.log("방 참가 성공");

      // 참가 후 플레이어 목록 새로고침
      setTimeout(fetchPlayers, 500);
    } catch (error) {
      console.error("방 참가 실패:", error);
      if (error.response?.status === 400) {
        alert(error.response.data || "방이 가득 찼거나 참가할 수 없습니다.");
        navigate("/blankgamelobby");
      }
    }
  };

  // 방 참가 처리
  useEffect(() => {
    if (currentRoomId && userInfo?.id && !currentPlayer) {
      joinRoom();
    }
  }, [currentRoomId, userInfo, currentPlayer]);

  // WebSocket 연결 (최신 @stomp/stompjs 사용)
  useEffect(() => {
    if (!currentRoomId || !userInfo?.id) return;

    console.log("WebSocket 연결 시도:", currentRoomId);

    // 최신 STOMP 클라이언트 생성
    const client = Stomp.over(() => new SockJS(`${API_BASE_URL}/ws-game`));

    // 디버그 모드 활성화 (문제 해결을 위해)
    client.debug = (str) => {
      console.log("STOMP Debug: " + str);
    };

    // 연결 헤더 설정
    const connectHeaders = {};
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      connectHeaders.Authorization = `Bearer ${accessToken}`;
    }

    // WebSocket 연결
    client.connect(
      connectHeaders,
      (frame) => {
        console.log("✅ WebSocket 연결 성공:", frame);
        setIsConnected(true);
        setConnectionStatus("연결됨");

        // 방 토픽 구독 (플레이어 상태 업데이트)
        const roomSubscription = client.subscribe(
          `/topic/room/${currentRoomId}`,
          (message) => {
            try {
              console.log("📨 방 상태 업데이트 메시지 원본:", message.body);
              const data = JSON.parse(message.body);
              console.log("📨 방 상태 업데이트 메시지 파싱:", data);

              // 플레이어 목록이 배열로 전송되는 경우
              if (Array.isArray(data)) {
                console.log("🔄 플레이어 목록 업데이트:", data);
                setPlayers(data);

                // 현재 플레이어 정보도 업데이트
                const me = data.find((p) => p.userId === userInfo.id);
                if (me) {
                  console.log("👤 현재 플레이어 정보 업데이트:", me);
                  setCurrentPlayer(me);
                } else {
                  // 현재 사용자가 플레이어 목록에 없으면 방에서 나간 것으로 처리
                  console.log(
                    "👋 현재 사용자가 플레이어 목록에 없음 - 방에서 나감"
                  );
                  setCurrentPlayer(null);
                }
              } else {
                console.log("📢 기타 방 메시지:", data);
              }
            } catch (error) {
              console.error(
                "❌ 방 메시지 파싱 에러:",
                error,
                "원본:",
                message.body
              );
            }
          },
          { id: `room-${currentRoomId}-${userInfo.id}` } // 구독 ID 추가
        );

        // 게임 시작 토픽 구독
        const gameStartSubscription = client.subscribe(
          `/topic/game/start/${currentRoomId}`,
          (message) => {
            try {
              const gameStartData = JSON.parse(message.body);
              console.log("🎮 === RoomWaitPage에서 게임 시작 메시지 수신! ===");
              console.log("게임 데이터:", gameStartData);

              const {
                quizList,
                players: gamePlayers,
                roomId: gameRoomId,
              } = gameStartData;

              // 퀴즈 데이터 검증 - 더 상세하게
              console.log("퀴즈 데이터 상세 검증:", {
                quizList: quizList,
                quizListType: typeof quizList,
                quizListLength: quizList?.length,
                isArray: Array.isArray(quizList),
                firstQuiz: quizList?.[0],
              });

              if (
                !quizList ||
                !Array.isArray(quizList) ||
                quizList.length === 0
              ) {
                console.error("❌ 퀴즈 데이터가 없거나 올바르지 않습니다!", {
                  quizList,
                  gameStartData,
                });
                alert("퀴즈 데이터를 받지 못했습니다. 다시 시도해주세요.");
                return;
              }

              console.log("🚀 blankgamemulti 페이지로 이동 시작...");
              console.log("전달할 데이터:", {
                roomId: gameRoomId || currentRoomId,
                quizList: quizList,
                players: gamePlayers || players,
                userInfo: userInfo,
              });

              navigate("/blankgamemulti", {
                state: {
                  roomId: gameRoomId || currentRoomId,
                  quizList: quizList, // 확실히 전달
                  players: gamePlayers || players,
                  userInfo: userInfo,
                },
              });
              console.log("✅ 페이지 이동 완료");
            } catch (error) {
              console.error("❌ 게임 시작 메시지 파싱 에러:", error);
            }
          },
          { id: `game-start-${currentRoomId}-${userInfo.id}` } // 구독 ID 추가
        );

        // 구독 정보 저장 (cleanup용)
        client.roomSubscription = roomSubscription;
        client.gameStartSubscription = gameStartSubscription;
      },
      (error) => {
        console.error("❌ WebSocket 연결 실패:", error);
        setConnectionStatus("연결 실패");
        setIsConnected(false);
      }
    );

    // cleanup - 페이지를 떠날 때 방 나가기 API 호출
    return () => {
      const cleanup = async () => {
        console.log("🚪 페이지 cleanup 시작");

        // 현재 플레이어가 있으면 방에서 나가기
        if (currentPlayer?.id) {
          try {
            console.log("🔄 페이지 이탈로 인한 방 나가기:", currentPlayer.id);
            await axiosInstance.post(`/api/rooms/${currentRoomId}/leave`);
            console.log("✅ 방 나가기 완료");
          } catch (error) {
            console.error("❌ 방 나가기 실패:", error);
          }
        }

        // WebSocket 연결 해제
        if (client && client.connected) {
          console.log("🔌 WebSocket 연결 해제");
          try {
            if (client.roomSubscription) {
              client.roomSubscription.unsubscribe();
            }
            if (client.gameStartSubscription) {
              client.gameStartSubscription.unsubscribe();
            }
            client.disconnect();
          } catch (error) {
            console.error("WebSocket 해제 중 오류:", error);
          }
        }
      };

      cleanup();
    };
  }, [currentRoomId, userInfo?.id, navigate, currentPlayer?.id]);

  // 브라우저 이벤트 감지 - 수정된 부분
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log("🔄 페이지 언로드 감지 (새로고침/브라우저 닫기)");

      if (currentPlayer?.id) {
        // 동기적으로 처리 - sendBeacon 사용
        const formData = new FormData();
        navigator.sendBeacon(
          `${API_BASE_URL}/api/rooms/${currentRoomId}/leave`,
          formData
        );
        console.log("📡 sendBeacon으로 방 나가기 요청 전송");
      }
    };

    const handlePopState = async (event) => {
      console.log("🔄 뒤로가기/앞으로가기 감지");

      if (currentPlayer?.id) {
        try {
          console.log("🔄 브라우저 네비게이션으로 인한 방 나가기");
          await axiosInstance.post(`/api/rooms/${currentRoomId}/leave`);
          console.log("✅ 네비게이션으로 인한 방 나가기 완료");
        } catch (error) {
          console.error("❌ 방 나가기 실패:", error);
        }
      }
    };

    // 브라우저 뒤로가기/앞으로가기 감지를 위한 history 변경 감지
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden" && currentPlayer?.id) {
        console.log("🔄 페이지 숨김 감지 (탭 전환/최소화)");

        // 페이지가 숨겨지면 방 나가기 (선택사항)
        try {
          await axiosInstance.post(`/api/rooms/${currentRoomId}/leave`);
          console.log("✅ 페이지 숨김으로 인한 방 나가기 완료");
        } catch (error) {
          console.error("❌ 방 나가기 실패:", error);
        }
      }
    };

    // 페이지 포커스 감지 (다른 탭으로 이동했다가 돌아올 때)
    const handleFocus = () => {
      console.log("🔄 페이지 포커스 복귀");
      // 포커스가 돌아오면 플레이어 목록을 다시 가져와서 동기화
      if (currentRoomId && userInfo?.id) {
        fetchPlayers();
      }
    };

    const handleBlur = async () => {
      console.log("🔄 페이지 포커스 잃음");
      // 포커스를 잃을 때는 특별한 동작 하지 않음 (너무 민감할 수 있음)
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [currentPlayer?.id, currentRoomId, userInfo?.id]);

  // React Router의 navigate 감지를 위한 추가 useEffect
  useEffect(() => {
    // 컴포넌트가 언마운트될 때 방 나가기 처리
    return () => {
      console.log("🔄 RoomWaitPage 컴포넌트 언마운트");

      // 현재 플레이어가 있으면 방에서 나가기
      if (currentPlayer?.id && currentRoomId) {
        // 비동기 함수를 즉시 실행
        (async () => {
          try {
            console.log("🔄 컴포넌트 언마운트로 인한 방 나가기");
            await axiosInstance.post(`/api/rooms/${currentRoomId}/leave`);
            console.log("✅ 컴포넌트 언마운트 방 나가기 완료");
          } catch (error) {
            console.error("❌ 컴포넌트 언마운트 방 나가기 실패:", error);
          }
        })();
      }
    };
  }, []); // 빈 의존성 배열로 컴포넌트 언마운트 시에만 실행

  // 준비 완료 처리
  const handleReady = async () => {
    if (!currentPlayer) {
      alert("플레이어 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      const accessToken = Cookies.get("accessToken");
      console.log("준비 상태 변경 시도:", {
        playerId: currentPlayer.id,
        accessToken: accessToken,
        userInfo: userInfo,
        currentPlayer: currentPlayer,
        players: players,
      });

      // HTTP API로 준비 상태 변경 (axiosInstance의 기본 설정 사용)
      const response = await axiosInstance.post(
        `/api/rooms/player/${currentPlayer.id}/ready?ready=true`
      );

      console.log("준비 완료 처리 성공:", response.data);

      // UI 즉시 업데이트
      setCurrentPlayer((prev) => ({ ...prev, ready: true }));

      // 모든 플레이어가 준비되었는지 확인
      const allReady = players.every(
        (p) => p.ready || p.id === currentPlayer.id
      );
      console.log("모든 플레이어 준비 상태 확인:", {
        players: players,
        currentPlayerId: currentPlayer.id,
        allReady: allReady,
      });
    } catch (error) {
      console.error("준비 상태 변경 실패:", error);
      console.error("에러 상세:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });
      alert("준비 상태 변경에 실패했습니다.");
    }
  };

  // 준비 취소 처리
  const handleNotReady = async () => {
    if (!currentPlayer) {
      alert("플레이어 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      // HTTP API로 준비 상태 변경
      await axiosInstance.post(
        `/api/rooms/player/${currentPlayer.id}/ready?ready=false`
      );

      console.log("준비 취소 처리 성공");

      // UI 즉시 업데이트
      setCurrentPlayer((prev) => ({ ...prev, ready: false }));
    } catch (error) {
      console.error("준비 상태 변경 실패:", error);
      alert("준비 상태 변경에 실패했습니다.");
    }
  };

  // 로딩 상태
  if (!currentRoomId || !userInfo?.id) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>로딩 중...</h2>
      </div>
    );
  }

  // 방 나가기 버튼 클릭 시 준비 상태 취소
  const handleLeaveRoom = async () => {
    console.log("🚪 방 나가기 버튼 클릭");
    console.log("현재 상태:", { currentRoomId, currentPlayer });

    try {
      // 서버의 방 나가기 API 호출
      console.log("🔄 서버에 방 나가기 요청:", currentRoomId);
      const response = await axiosInstance.post(
        `/api/rooms/${currentRoomId}/leave`
      );
      console.log("✅ 방 나가기 API 응답:", response.status, response.data);

      // 로비로 이동
      navigate("/blankgamelobby");
    } catch (error) {
      console.error("❌ 방 나가기 실패:", error);
      console.error("❌ 에러 상세:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // 에러가 발생해도 로비로 이동
      if (error.response?.status === 401) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        alert(
          "방 나가기 중 오류가 발생했습니다: " +
            (error.response?.data || error.message)
        );
        navigate("/blankgamelobby");
      }
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>게임 대기방 (방 번호: {currentRoomId})</h2>

      {/* 연결 상태 */}
      <div
        style={{
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
          border: `1px solid ${isConnected ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        WebSocket 상태: {connectionStatus}
      </div>

      {/* 사용자 정보 */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
          border: "1px solid #dee2e6",
        }}
      >
        <strong>내 정보:</strong> {userInfo.nickname} (ID: {userInfo.id})
        {currentPlayer && (
          <div style={{ marginTop: "5px", fontSize: "14px" }}>
            플레이어 ID: {currentPlayer.id} | 상태:{" "}
            <span
              style={{ color: currentPlayer.ready ? "#28a745" : "#dc3545" }}
            >
              {currentPlayer.ready ? "준비 완료" : "대기 중"}
            </span>
          </div>
        )}
      </div>

      {/* 준비 버튼 */}
      <div style={{ marginBottom: "20px" }}>
        {currentPlayer?.ready ? (
          <button
            onClick={handleNotReady}
            style={{
              padding: "12px 24px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            준비 취소
          </button>
        ) : (
          <button
            onClick={handleReady}
            disabled={!currentPlayer}
            style={{
              padding: "12px 24px",
              backgroundColor: currentPlayer ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: currentPlayer ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            게임 준비 완료
          </button>
        )}
      </div>

      {/* 플레이어 목록 */}
      <div>
        <h3>참가자 목록 ({players.length}명)</h3>
        {players.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
              color: "#6c757d",
            }}
          >
            플레이어 목록을 불러오는 중...
          </div>
        ) : (
          <div>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: "12px",
                  margin: "8px 0",
                  backgroundColor:
                    player.userId === userInfo.id ? "#e3f2fd" : "#ffffff",
                  border:
                    player.userId === userInfo.id
                      ? "2px solid #2196f3"
                      : "1px solid #dee2e6",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div>
                  <strong style={{ fontSize: "16px" }}>
                    {player.nickname}
                  </strong>
                  {player.userId === userInfo.id && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "14px",
                        color: "#2196f3",
                        fontWeight: "bold",
                      }}
                    >
                      (나)
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>
                    {player.ready ? "🟢" : "🔴"}
                  </span>
                  <span
                    style={{
                      color: player.ready ? "#28a745" : "#dc3545",
                    }}
                  >
                    {player.ready ? "준비 완료" : "대기 중"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <strong>💡 게임 시작 조건:</strong>
        <br />
        • 모든 참가자가 준비를 완료하면 자동으로 게임이 시작됩니다.
        <br />• 게임 중에는 동일한 문제를 모든 참가자가 함께 풉니다.
      </div>

      {/* 나가기 버튼 - 수정된 부분 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleLeaveRoom} // 수정: 새로운 핸들러 사용
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          방 나가기
        </button>
      </div>
    </div>
  );
}
