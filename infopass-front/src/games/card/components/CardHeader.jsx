import React from 'react';

const CardHeader = ({randomSubject}) => {
  return (
    <div className="game-header">
      <h1>정보처리기사 카드게임</h1>
      <p>질문과 답변을 매칭하여 모든 카드를 찾아보세요!</p>
      <p>현재 과목: {randomSubject}</p>
    </div>
  );
};

export default CardHeader;
