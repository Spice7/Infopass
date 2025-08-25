import { useState, useEffect, useCallback, useRef } from 'react';

export const useCardTimer = (isPlaying, gameStarted, gameMode, onTimeout) => {
  const [timer, setTimer] = useState(0);
  const [remainingTime, setRemainingTime] = useState(300);
  const hasTimedOutRef = useRef(false);

  // 시간 포맷팅 함수
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 게임 모드에 따른 시간 제한 설정
  const setTimeLimitByMode = useCallback((mode) => {
    if (mode === 'timeAttack') {
      const newTimeLimit = 180; // 타임어택 모드: 180초 (테스트용)
      setRemainingTime(newTimeLimit);
    } else {
      // 일반 모드일 때는 시간 제한 없음
      setRemainingTime(300);
    }
  }, []);

  // 타이머 효과 및 타임어택 시간 초과 처리
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      // 새 게임 시작 시 타임아웃 플래그 초기화
      hasTimedOutRef.current = false;
      interval = setInterval(() => {
        setTimer(prev => prev + 1);

        // 타임어택 모드일 때 남은 시간 감소
        if (gameMode === 'timeAttack') {
          setRemainingTime(prev => {
            if (prev <= 1) {
              // 시간 초과: 최초 1회만 종료 콜백 호출
              if (!hasTimedOutRef.current) {
                hasTimedOutRef.current = true;
                // 타임아웃 콜백 호출
                if (onTimeout) {
                  onTimeout();
                }
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, gameMode, onTimeout]);

  // 게임 모드 변경 시 시간 제한 설정
  useEffect(() => {
    setTimeLimitByMode(gameMode);
  }, [gameMode, setTimeLimitByMode]);

  // 게임 재시작 시 타이머 초기화
  const resetTimer = () => {
    setTimer(0);
    if (gameMode === 'timeAttack') {
      setRemainingTime(10); // 타임어택 모드: 10초 (테스트용)
    }
  };

  // 최종 점수 계산 (시간 보너스 포함)
  const calculateFinalScore = (baseScore) => {
    let finalScore = baseScore;

    if (gameMode === 'timeAttack') {
      const timeBonus = Math.max(0, Math.floor(remainingTime / 1));
      finalScore += timeBonus;
    }
    // 일반모드에서는 시간 보너스 없이 기본 점수만 반환

    return finalScore;
  };

  return {
    // 상태
    timer,
    remainingTime,
    
    // 함수
    formatTime,
    setTimeLimitByMode,
    resetTimer,
    calculateFinalScore
  };
};
