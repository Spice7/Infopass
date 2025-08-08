import React, { useState, useEffect, useRef } from "react";
import "./Rank.css";

const Rank = () => {
  const [selectedWeek, setSelectedWeek] = useState("2024년 07월 29일 ~ 04일");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const canvasRef = useRef(null);

  // 임시 데이터 - 실제로는 API에서 가져올 데이터
  const rankingData = [
    { rank: 1, name: "호평물주먹", score: 318, profile: "🦀", medal: "🥇" },
    { rank: 2, name: "구민이바보", score: 219, profile: "👓", medal: "🥈" },
    { rank: 3, name: "민우낑", score: 146, profile: "🟡", medal: "🥉" },
    { rank: 4, name: "백realtest", score: 129, profile: "👤" },
    { rank: 5, name: "정프로", score: 36, profile: "🎩" },
    { rank: 6, name: "라이라이차차차", score: 25, profile: "🐼" },
    { rank: 7, name: "돌팔이", score: 24, profile: "👤" },
    { rank: 8, name: "동글엄마", score: 10, profile: "🥤" },
    { rank: 9, name: "테스트유저1", score: 8, profile: "👤" },
    { rank: 10, name: "테스트유저2", score: 7, profile: "👤" },
    { rank: 11, name: "테스트유저3", score: 6, profile: "👤" },
    { rank: 12, name: "테스트유저4", score: 5, profile: "👤" },
    { rank: 13, name: "테스트유저5", score: 4, profile: "👤" },
    { rank: 14, name: "테스트유저6", score: 3, profile: "👤" },
    { rank: 15, name: "테스트유저7", score: 2, profile: "👤" },
    { rank: 16, name: "테스트유저8", score: 1, profile: "👤" },
    { rank: 17, name: "테스트유저9", score: 1, profile: "👤" },
    { rank: 18, name: "테스트유저10", score: 1, profile: "👤" },
    { rank: 19, name: "테스트유저11", score: 1, profile: "👤" },
    { rank: 20, name: "테스트유저12", score: 1, profile: "👤" },
    { rank: 21, name: "테스트유저13", score: 1, profile: "👤" },
    { rank: 22, name: "테스트유저14", score: 1, profile: "��" },
    { rank: 23, name: "테스트유저15", score: 1, profile: "👤" },
    { rank: 24, name: "테스트유저16", score: 1, profile: "👤" },
    { rank: 25, name: "테스트유저17", score: 1, profile: "👤" },
    { rank: 26, name: "테스트유저18", score: 1, profile: "👤" },
    { rank: 27, name: "테스트유저19", score: 1, profile: "👤" },
    { rank: 28, name: "테스트유저20", score: 1, profile: "👤" },
    { rank: 29, name: "테스트유저21", score: 1, profile: "👤" },
    { rank: 30, name: "테스트유저22", score: 1, profile: "👤" },
  ];

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
    setIsDatePickerOpen(false);
  };

  // Canvas 별 효과
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
      for (let i = 0; i < 200; i++) {
        stars.push(spawnStars());
      }
    }
    function animate() {
      animationId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.update();
      });
    }
    init();
    animate();
    // 클린업 함수
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
        {rankingData.length > 0 && (
          <div className="first-place">
            <div className="first-place-content">
              <div className="first-place-profile">
                <div className="profile-image large">
                  {rankingData[0].profile}
                </div>
              </div>
              <div className="first-place-info">
                <div className="first-place-name">{rankingData[0].name}</div>
                <div className="first-place-score">
                  {rankingData[0].score}px
                </div>
              </div>
              <div className="first-place-medal">{rankingData[0].medal}</div>
            </div>
          </div>
        )}

        {/* 랭킹 리스트 */}
        <div className="ranking-list">
          {rankingData.map((user, index) => (
            <div
              key={user.rank}
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
        {rankingData.length > 0 && (
          <div className="first-place">
            <div className="first-place-content">
              <div className="first-place-profile">
                <div className="profile-image large">
                  {rankingData[0].profile}
                </div>
              </div>
              <div className="first-place-info">
                <div className="first-place-name">{rankingData[0].name}</div>
                <div className="first-place-score">
                  {rankingData[0].score}px
                </div>
              </div>
              <div className="first-place-medal">{rankingData[0].medal}</div>
            </div>
          </div>
        )}

        {/* 랭킹 리스트 */}
        <div className="ranking-list">
          {rankingData.map((user, index) => (
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
