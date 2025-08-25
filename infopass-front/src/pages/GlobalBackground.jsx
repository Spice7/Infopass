import React, { useEffect, useRef } from 'react';
import './GlobalBackground.css';

// 전역 별 배경 캔버스 + 자식 콘텐츠 오버레이 레이아웃
const GlobalBackground = ({ children }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = 0;
    let animationId;
    let stars = [];

    const DPR = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(DPR, DPR);
      initStars();
    }

    class Star {
      constructor(x, y, r, a, flickerMs) {
        this.x = x; this.y = y; this.r = r; this.a = a; this.flickerMs = flickerMs; this.elapsed = 0;
      }
      update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.flickerMs) {
          this.r = rand(0.5, 2.2);
          this.a = rand(0.25, 0.95);
          this.flickerMs = rand(600, 2600);
          this.elapsed = 0;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.a})`;
        ctx.fill();
      }
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function initStars() {
      const count = Math.min(260, Math.floor(window.innerWidth * window.innerHeight / 9000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push(new Star(rand(0, window.innerWidth), rand(0, window.innerHeight), rand(0.5, 2.2), rand(0.25, 1), rand(600, 2600)));
      }
    }

    function loop(ts) {
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime;
      // 60fps 이하로 부드럽게 유지
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      stars.forEach(s => s.update(dt));
      lastTime = ts;
      animationId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="global-bg-root">
      <canvas ref={canvasRef} className="global-star-canvas" aria-hidden="true" />
      <div className="global-content-layer">{children}</div>
    </div>
  );
};

export default GlobalBackground;
