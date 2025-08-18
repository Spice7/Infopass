export default function ActionSection({
  showNextButton,
  checkAnswer,
  generateXml,
  generateJavaCode,
  resetBlocks,
  goToNextQuestion,
  disabled
}) {
  return (
    <div className="action-section">
      {!showNextButton ? (
        <div className="action-buttons">
          <button onClick={checkAnswer} className="check-answer-btn" disabled={disabled}>
            정답체크
          </button>
          <div className="code-generation-buttons">
            <button onClick={generateXml} className="generate-xml-btn">XML 생성</button>
            <button onClick={generateJavaCode} className="generate-java-btn">Java 코드 생성</button>
          </div>
          <button onClick={resetBlocks} className="reset-blocks-btn">블록 초기화</button>
        </div>
      ) : (
        <div className="action-buttons">
          <button onClick={goToNextQuestion} className="next-question-btn">다음 문제</button>
          <button onClick={resetBlocks} className="reset-blocks-btn">블록 초기화</button>
        </div>
      )}
    </div>
  );
}


