import { useState } from 'react';
import { applyExp } from '../user/gameResult';

export const useExpAnimation = () => {
  const [expBarAnimation, setExpBarAnimation] = useState(false);
  const [expBarFrom, setExpBarFrom] = useState(0);
  const [expBarTo, setExpBarTo] = useState(0);
  const [animatedExp, setAnimatedExp] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [showExpAnimation, setShowExpAnimation] = useState(false);
  const [expCount, setExpCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [sessionExp, setSessionExp] = useState(0);

  // 경험치 애니메이션 시작
  const startExpAnimation = (expAmount, newExp, newLevel, currentExp, currentLevel) => {
    setShowExpAnimation(true);
    setExpCount(0);
    
    // 경험치 카운트 애니메이션
    const duration = 2000; // 2초
    const steps = 30;
    const increment = expAmount / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentExpCount = Math.floor(increment * currentStep);
      setExpCount(currentExpCount);
      
      if (currentStep >= steps) {
        setExpCount(expAmount);
        clearInterval(timer);
        
        // 경험치 바 애니메이션 시작
        startExpBarAnimation(currentExp, newExp, currentLevel, newLevel);
        
        // 애니메이션 완료 후 3초 뒤 숨김
        setTimeout(() => setShowExpAnimation(false), 3000);
      }
    }, duration / steps);
  };

  // 경험치 바 애니메이션 시작
  const startExpBarAnimation = (fromExp, toExp, currentLevel, newLevel) => {
    console.log('경험치 바 애니메이션 시작:', { fromExp, toExp, currentLevel, newLevel });
    
    // 애니메이션 상태 설정
    setExpBarFrom(fromExp);
    setExpBarTo(toExp);
    setExpBarAnimation(true);

    const fromPct = (fromExp % 100 + 100) % 100;
    const toPctRaw = (toExp % 100 + 100) % 100;
    const didLevelUp = newLevel > currentLevel;

    console.log('애니메이션 설정:', { fromPct, toPctRaw, didLevelUp });

    if (!didLevelUp) {
      // 단일 구간 애니메이션: from -> to
      console.log('단일 구간 애니메이션:', fromPct, '->', toPctRaw);
      
      // 레벨업이 없어도 현재 사용자 레벨 설정
      setAnimatedLevel(currentLevel);
      
      animateExp(fromPct, toPctRaw, () => {
        setExpBarAnimation(false);
        console.log('애니메이션 완료');
      });
      return;
    }

    // 2) 레벨업: from -> 100, 그 다음 0 -> to
    console.log('레벨업 애니메이션 1단계: 현재 경험치 -> 100');
    
    // 1단계: 현재 경험치 → 100
    animateExp(fromPct, 100, () => {
      console.log('1단계 완료, 레벨업 처리 및 2단계 시작');
      
      // 레벨업 처리
      setAnimatedLevel(newLevel);
      
      // 2단계 애니메이션 시작: 0 -> 새로운 경험치
      setTimeout(() => {
        console.log('레벨업 애니메이션 2단계 시작: 0 ->', toPctRaw);
        animateExp(0, toPctRaw, () => {
          console.log('2단계 완료');
          setExpBarAnimation(false);
        });
        
        // 레벨업 연출
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }, 200);
    });
  };

  // 경험치 애니메이션 실행 함수
  const animateExp = (startExp, endExp, onComplete) => {
    let currentExp = startExp;
    const increment = (endExp - startExp) / 30; // 30단계로 나누기
    const timer = setInterval(() => {
      currentExp += increment;
      if (currentExp >= endExp) {
        currentExp = endExp;
        clearInterval(timer);
        onComplete?.();
      }
      setAnimatedExp(currentExp);
    }, 50);
  };

  // 게임 종료 시 경험치/점수 저장 (공용)
  const saveScoreAndExp = async (finalScore, userInfo, gameType = "general", customSaveFunction = null) => {
    try {
      // 게임 타입에 따른 경험치 계산 (기본값)
      let expDelta = Math.floor(finalScore / 3);

      const data = ({
        user_id: userInfo?.id,
        score: finalScore,
        user_exp: expDelta,
        user_type: gameType
      });

      // 커스텀 저장 함수가 있다면 먼저 실행 (게임별 특화 로직)
      if (customSaveFunction && typeof customSaveFunction === 'function') {
        try {
          await customSaveFunction(data);
        } catch (saveError) {
          console.error('게임별 저장 실패:', saveError);
        }
      }

      // 경험치 증가 및 레벨업 처리
      try {
        const expResponse = await applyExp(expDelta);
        const { exp: newExp, level: newLevel } = expResponse.data;
        
        setSessionExp(prev => prev + expDelta);
        
        // 경험치 애니메이션 시작
        startExpAnimation(expDelta, newExp, newLevel, userInfo.exp, userInfo.level);
      } catch (expError) {
        console.error('경험치 증가 실패:', expError);
      }
      console.log('점수/경험치 저장 성공:', data);
    } catch (e) {
      console.error('점수/경험치 저장 실패:', e);
    }
  };

  // 초기화 함수
  const initializeExp = (userLevel, userExp) => {
    setAnimatedLevel(userLevel || 0);
    setAnimatedExp((userExp || 0) % 100);
  };


  // 상태 초기화
  const resetExp = () => {
    setSessionExp(0);
    setExpBarAnimation(false);
    setShowExpAnimation(false);
    setShowLevelUp(false);
  };

  return {
    // 상태
    expBarAnimation,
    expBarFrom,
    expBarTo,
    animatedExp,
    animatedLevel,
    showExpAnimation,
    expCount,
    showLevelUp,
    sessionExp,
    
    // 함수
    startExpAnimation,
    startExpBarAnimation,
    saveScoreAndExp,
    initializeExp,
    resetExp,
    
    // 현재 사용자 정보 (useCardGame에서 필요)
    userLevel: animatedLevel,
    userExp: animatedExp
  };
};
