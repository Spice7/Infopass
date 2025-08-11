import React from 'react';
import './BlockLoading.css';

const BlockLoading = () => {
  return (
    <div className="block-loading-container">
      <div className="background-scroll">
        <img 
          src="/ox_image/002.png" 
          alt="배경" 
          className="background-image"
        />
        <img 
          src="/ox_image/002.png" 
          alt="배경" 
          className="background-image"
        />
      </div>
      
      <div className="loading-content">
        <div className="loading-title">블록을 준비하고 있어요!</div>
        
        <div className="character-container">
          <div className="character">
            <img 
              src="/ox_image/char3.png" 
              alt="외계인 캐릭터" 
              className="character-image"
            />
            <div className="block-item">
              <div className="block"></div>
            </div>
          </div>
        </div>
        
        <div className="loading-text">문제 데이터를 불러오는 중...</div>
        
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default BlockLoading;
