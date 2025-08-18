import React from 'react';
import './CardLoading.css';

const CardLoading = () => {
  return (
    <div className="card-loading-container">
      <div className="card-background-scroll">
        <img 
          src="/ox_image/002.png" 
          alt="배경" 
          className="card-background-image"
        />
        <img 
          src="/ox_image/002.png" 
          alt="배경" 
          className="card-background-image"
        />
      </div>
      
      <div className="card-loading-content">
        <div className="card-loading-title">카드게임을 준비하고 있어요!</div>
        
        <div className="card-character-container">
          <div className="card-character">
            <img 
              src="/ox_image/char3.png" 
              alt="외계인 캐릭터" 
              className="card-character-image"
            />
            <div className="card-item">
              <div className="cardGame"></div>
            </div>
          </div>
        </div>
        
        <div className="card-loading-text">문제 데이터를 불러오는 중...</div>
        
        <div className="card-loading-dots">
          <div className="card-dot"></div>
          <div className="card-dot"></div>
          <div className="card-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default CardLoading;
