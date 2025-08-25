import React, { useState, useEffect, useRef } from "react";
import "./Rank.css";

const Rank = () => {
  const [selectedWeek, setSelectedWeek] = useState("2024년 07월 29일 ~ 04일");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const canvasRef = useRef(null);
  const [weeklyRanking, setWeeklyRanking] = useState([]);
  const [realtimeRanking, setRealtimeRanking] = useState([]);

  // 주간 랭킹 데이터 가져오기
  useEffect(() => {
    fetch("http://localhost:9000/rank?type=weekly", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include", // ✅ .then()에서도 옵션 지정 가능
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Weekly ranking:", data);
        if (Array.isArray(data)) {
          const formattedData = data.map((user, index) => ({
            rank: index + 1,
            name: user.nickname || user.username || "Unknown",
            score: user.totalScore || 0,
            profile: user.profileImage || "👤",
            medal: index < 3 ? ["🥇", "🥈", "🥉"][index] : null,
          }));
          setWeeklyRanking(formattedData);
        } else {
          console.error("Weekly ranking data is not an array:", data);
          setWeeklyRanking([]);
        }
      })
      .catch((err) => {
        console.error("Weekly ranking fetch error:", err);
        setWeeklyRanking([]);
      });
  }, [selectedWeek]); // 선택된 주가 변경될 때마다 데이터 새로 가져오기

  // 실시간 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRealtimeRanking = () => {
      fetch("http://localhost:9000/rank?type=realtime", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // 캐시 사용하지 않음
        // credentials: "include", // ✅ .then()에서도 옵션 지정 가능
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Realtime ranking:", data);
          if (Array.isArray(data)) {
            const formattedData = data.map((user, index) => ({
              rank: index + 1,
              name: user.nickname || user.username || "Unknown",
              score: user.totalScore || 0,
              profile: user.profileImage || "👤",
              medal: index < 3 ? ["🥇", "🥈", "🥉"][index] : null,
            }));
            setRealtimeRanking(formattedData);
          } else {
            console.error("Realtime ranking data is not an array:", data);
            setRealtimeRanking([]);
          }
        })
        .catch((err) => {
          console.error("Realtime ranking fetch error:", err);
          setRealtimeRanking([]);
        });
    };

    fetchRealtimeRanking(); // 초기 데이터 가져오기
    const interval = setInterval(fetchRealtimeRanking, 30000); // 10초마다 실시간 데이터 업데이트

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
    setIsDatePickerOpen(false);
  };

  // Canvas 별 효과
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let lastTime = 0;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Star {
      constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.flickerInterval = Math.floor(Math.random() * 50) + 50;
        this.flickerCounter = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
      update() {
        this.flickerCounter++;
        if (this.flickerCounter === this.flickerInterval) {
          this.radius = getRandom(0.5, 2);
          this.color = `rgba(255, 255, 255, ${getRandom(0.3, 1)})`;
          this.flickerCounter = 0;
          this.flickerInterval = Math.floor(Math.random() * 50) + 50;
        }
        this.draw();
      }
    }
    function getRandom(min, max) {
      return Math.random() * (max - min) + min;
    }
    function spawnStars() {
      const x = getRandom(0, canvas.width);
      const y = getRandom(0, canvas.height);
      const radius = getRandom(0.5, 2);
      const color = `rgba(255, 255, 255, ${getRandom(0.3, 1)})`;
      return new Star(x, y, radius, color);
    }
    let stars = [];
    let animationId;

    function init() {
      stars = [];
      for (let i = 0; i < 100; i++) {
        // 별 개수를 200개에서 100개로 줄임
        stars.push(spawnStars());
      }
    }

    function animate(now) {
      if (!lastTime || now - lastTime > 33) {
        // 30fps로 제한
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach((star) => {
          star.update();
        });
        lastTime = now;
      }
      animationId = requestAnimationFrame(animate);
    }

    init();
    animate(performance.now());

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="ranking-wrapper">
      <canvas ref={canvasRef} id="starCanvas" className="star-canvas"></canvas>

      {/* 주간 랭킹 */}
      <div className="ranking-container">
        <div className="ranking-header">
          <div className="header-left">
            <h1 className="ranking-title">주간 랭킹</h1>
            <div className="info-icon">ℹ️</div>
          </div>
          <div className="date-selector">
            <div
              className="date-display"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <span>{selectedWeek}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {isDatePickerOpen && (
              <div className="date-picker">
                <div
                  onClick={() => handleWeekChange("2024년 07월 29일 ~ 04일")}
                >
                  2024년 07월 29일 ~ 04일
                </div>
                <div
                  onClick={() => handleWeekChange("2024년 07월 22일 ~ 28일")}
                >
                  2024년 07월 22일 ~ 28일
                </div>
                <div
                  onClick={() => handleWeekChange("2024년 07월 15일 ~ 21일")}
                >
                  2024년 07월 15일 ~ 21일
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1위 유저 (특별 스타일) */}
        {weeklyRanking.length > 0 && (
          <div className="first-place">
            <div className="first-place-content">
              <div className="first-place-profile">
                <div className="profile-image large">
                  {weeklyRanking[0].profile}
                </div>
              </div>
              <div className="first-place-info">
                <div className="first-place-name">{weeklyRanking[0].name}</div>
                <div className="first-place-score">
                  {weeklyRanking[0].score}px
                </div>
              </div>
              <div className="first-place-medal">{weeklyRanking[0].medal}</div>
            </div>
          </div>
        )}

        {/* 랭킹 리스트 */}
        <div className="ranking-list">
          {weeklyRanking.map((user, index) => (
            <div
              key={`weekly-${user.rank}`}
              className={`ranking-item ${index < 3 ? "top-three" : ""}`}
            >
              <div className="rank-number">
                {user.medal ? user.medal : user.rank}
              </div>
              <div className="user-profile">
                <div className="profile-image">{user.profile}</div>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-score">{user.score}px</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실시간 랭킹 */}
      <div className="ranking-container realtime">
        <div className="ranking-header">
          <div className="header-left">
            <h1 className="ranking-title">실시간 랭킹</h1>
            <div className="info-icon">⚡</div>
          </div>
          <div className="date-selector">
            <div className="date-display">
              <span>현재 시간</span>
              <span className="dropdown-arrow">🕐</span>
            </div>
          </div>
        </div>

        {/* 1위 유저 (특별 스타일) */}
        {realtimeRanking.length > 0 && (
          <div className="first-place">
            <div className="first-place-content">
              <div className="first-place-profile">
                <div className="profile-image large">
                  {realtimeRanking[0].profile}
                </div>
              </div>
              <div className="first-place-info">
                <div className="first-place-name">
                  {realtimeRanking[0].name}
                </div>
                <div className="first-place-score">
                  {realtimeRanking[0].score}px
                </div>
              </div>
              <div className="first-place-medal">
                {realtimeRanking[0].medal}
              </div>
            </div>
          </div>
        )}

        {/* 랭킹 리스트 */}
        <div className="ranking-list">
          {realtimeRanking.map((user, index) => (
            <div
              key={`realtime-${user.rank}`}
              className={`ranking-item ${index < 3 ? "top-three" : ""}`}
            >
              <div className="rank-number">
                {user.medal ? user.medal : user.rank}
              </div>
              <div className="user-profile">
                <div className="profile-image">{user.profile}</div>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-score">{user.score}px</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rank;
