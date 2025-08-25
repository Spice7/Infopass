import React from 'react';
import './CardGame.css';
import CardLoading from './loading/CardLoading';
import {
  CardHeader,
  GameModeSelector,
  GameInfo,
  CardsGrid,
  GameComplete,
  GameTimeout
} from './components';
import { useCardGame, useCardTimer } from './hooks';

const CardMain = () => {
  const {
    // 상태
    cards,
    matchedPairs,
    gameStarted,
    score,
    moves,
    isPlaying,
    gameMode,
    isLoading,
    questionData,
    randomSubject,
    showNextButton,
    sessionExp,
    showExpAnimation,
    expCount,
    userLevel,
    userExp,
    showLevelUp,
    expBarAnimation,
    expBarFrom,
    expBarTo,
    expBarPercent,
    expBarTransitionEnabled,
    
    // 함수
    startNewGame,
    handleCardClick,
    handleGameEnd,
    handleNextQuestions,
    changeGameMode,
    handleRestart,
    handleExitToMenu
  } = useCardGame();

  const {
    timer,
    remainingTime,
    formatTime,
    resetTimer,
    calculateFinalScore
  } = useCardTimer(isPlaying, gameStarted, gameMode, () => {
    // 타임아웃 시 게임 자동 종료 (자동 저장)
    handleGameEndWithScore({ isTimeout: true, autoSave: true });
  });

  // 게임 모드 변경 시 타이머 설정
  const handleModeChange = (mode) => {
    changeGameMode(mode);
    resetTimer(); // 모든 모드 변경 시 타이머 초기화
  };

  // 게임 시작 시 모드 전달
  const handleStartGame = () => {
    startNewGame();
  };

  // 게임 재시작 시 타이머도 초기화
  const handleGameRestart = () => {
    handleRestart();
    resetTimer();
  };

  // 게임 종료 시 최종 점수 계산 (자동 저장)
  const handleGameEndWithScore = async () => {
    const finalScore = calculateFinalScore(score);
    await handleGameEnd({ finalScore, autoSave: false });
  };

  if (isLoading) {
    return <CardLoading />;
  }

  return (
    <div className="card-game-container">
      <CardHeader randomSubject={randomSubject} />

      {!gameStarted ? (
        <GameModeSelector
          gameMode={gameMode}
          onModeChange={handleModeChange}
          onStartGame={handleStartGame}
        />
      ) : isPlaying ? (
        <>
          <GameInfo
            score={score}
            moves={moves}
            gameMode={gameMode}
            remainingTime={remainingTime}
            timer={timer}
            matchedPairs={matchedPairs}            
            formatTime={formatTime}
          />

          <CardsGrid
            cards={cards}
            onCardClick={handleCardClick}
            matchedPairs={matchedPairs}
            questionData={questionData}
            onRestart={handleGameRestart}
            onNextQuestions={handleNextQuestions}
            onGameEnd={handleGameEndWithScore}
            onExitToMenu={handleExitToMenu}
            showNextButton={showNextButton}
          />
        </>
      ) : (
        <>
           {!isPlaying && gameMode === 'normal' &&(
            <GameComplete
              score={score}
              moves={moves}
              gameMode={gameMode}
              remainingTime={remainingTime}
              timer={timer}
              sessionExp={sessionExp}
              showExpAnimation={showExpAnimation}
              expCount={expCount}
              userLevel={userLevel}
              userExp={userExp}
              showLevelUp={showLevelUp}
              expBarAnimation={expBarAnimation}
              expBarFrom={expBarFrom}
              expBarTo={expBarTo}
              expBarPercent={expBarPercent}
              expBarTransitionEnabled={expBarTransitionEnabled}
              onRestart={handleGameRestart}
              onExitToMenu={handleExitToMenu}
              formatTime={formatTime}
            />
          )}
          {!isPlaying && gameMode === 'timeAttack' && (
            remainingTime <= 0 || matchedPairs.length < questionData.length
          ) && (
            <GameTimeout
              score={score}
              moves={moves}
              matchedPairs={matchedPairs}
              sessionExp={sessionExp}
              showExpAnimation={showExpAnimation}
              expCount={expCount}
              userLevel={userLevel}
              userExp={userExp}
              showLevelUp={showLevelUp}
              expBarAnimation={expBarAnimation}
              expBarFrom={expBarFrom}
              expBarTo={expBarTo}
              expBarPercent={expBarPercent}
              expBarTransitionEnabled={expBarTransitionEnabled}
              onRestart={handleGameRestart}
              onExitToMenu={handleExitToMenu}
            />
          )}
          {!isPlaying && gameMode === 'normal' && matchedPairs.length < questionData.length && (
            <GameTimeout
              score={score}
              moves={moves}
              matchedPairs={matchedPairs}
              sessionExp={sessionExp}
              showExpAnimation={showExpAnimation}
              expCount={expCount}
              userLevel={userLevel}
              userExp={userExp}
              showLevelUp={showLevelUp}
              expBarAnimation={expBarAnimation}
              expBarFrom={expBarFrom}
              expBarTo={expBarTo}
              expBarPercent={expBarPercent}
              expBarTransitionEnabled={expBarTransitionEnabled}
              onRestart={handleGameRestart}
              onExitToMenu={handleExitToMenu}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CardMain;
