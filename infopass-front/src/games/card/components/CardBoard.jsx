import React from 'react';

const CardBoard = ({ cards, onCardClick }) => (
  <div className="card-board">
    {cards.map(card => (
      <div key={card.id} className={`card-item ${card.isFlipped ? 'flipped' : ''}`} onClick={() => onCardClick(card)}>
        {card.isFlipped || card.isMatched ? card.content : '?'}
      </div>
    ))}
  </div>
);

export default CardBoard;