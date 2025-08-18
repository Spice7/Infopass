export default function BlockHeader({ onReset }) {
  return (
    <div className="header">
      <h1>블록 코딩 게임</h1>
      <div className="controls">
        <button onClick={onReset} className="reset-game-btn">
          게임 초기화
        </button>
      </div>
    </div>
  );
}


