export default function QuestionSection({ question, solvedCount }) {
  if (!question) return null;
  return (
    <div className="question-section">
      <h2>문제</h2>
      <p>{question.question}</p>
      <div className="question-info">
        <span>카테고리: {question.category}</span><br></br>
        <span>해결된 문제: {solvedCount}개</span>
      </div>
    </div>
  );
}


