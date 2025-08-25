export function CompletionMessage({ onReset }) {
  return (
    <div className="completion-overlay">
      <div className="completion-message">
        <h2>🎉 모든 문제를 완료했습니다!</h2>
        <p>축하합니다! 모든 문제를 성공적으로 해결하셨습니다.</p>
        <button onClick={onReset}>새 게임 시작</button>
      </div>
    </div>
  );
}

export function CorrectMessage() {
  return (
    <div className="result-message correct">
      <p>🎉 정답입니다!</p>
    </div>
  );
}

export function IncorrectMessage() {
  return (
    <div className="result-message incorrect">
      <p>❌ 오답입니다. 다시 시도해보세요.</p>
    </div>
  );
}


