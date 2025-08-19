import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { JavaGenerator } from '../javaGenerator';
import { registerAllBlocks } from '../blocks';
import { generateNewSession, getRandomUnsolvedQuestion, submitAnswerToBackend } from '../BlockAPI';

// 블록 코딩 게임 상태와 로직을 캡슐화한 커스텀 훅
// 게임 시작, 초기화, 다음 문제 넘어가기 등 주요 기능들이 여기 있다

export function useBlockGame(userInfo) {
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [solvedQuestions, setSolvedQuestions] = useState(new Set());
  const [isCorrect, setIsCorrect] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // 블록 등록 (최초 1회)
  useEffect(() => {
    registerAllBlocks();
  }, []);

  // 툴박스 구성
  const toolbox = useMemo(() => {
    if (!currentQuestion) return null;
    try {
      const toolboxArray = JSON.parse(currentQuestion.toolbox);
      return {
        kind: 'flyoutToolbox',
        contents: toolboxArray.map(type => ({ kind: 'block', type }))
      };
    } catch (e) {
      console.error('Toolbox parsing error:', e);
      return null;
    }
  }, [currentQuestion]);

  // 다음 문제 로드
  const loadNextQuestion = useCallback(async (currentSessionId) => {
    setIsLoading(true);
    try {
      if (!userInfo || !userInfo.id) {
        setError('사용자 인증이 필요합니다.');
        return;
      }

      const question = await getRandomUnsolvedQuestion(userInfo.id, currentSessionId);
      if (!question) {
        setShowCompletionMessage(true);
        setCurrentQuestion(null);
        return;
      }

      setCurrentQuestion(question);
      setIsCorrect(null);
      setShowNextButton(false);
    } catch (err) {
      console.error('문제 로드 실패:', err);
      setError('문제를 로드할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  // 게임 초기화 (userInfo 의존)
  useEffect(() => {
    if (!userInfo) return;
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const newSessionId = await generateNewSession();
        setSessionId(newSessionId);
        setSolvedQuestions(new Set());
        setIsCorrect(null);
        setShowNextButton(false);
        setShowCompletionMessage(false);

        await loadNextQuestion(newSessionId);
      } catch (err) {
        console.error('게임 초기화 실패:', err);
        setError('게임을 초기화할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeGame();
  }, [userInfo, loadNextQuestion]);

  // 정답 체크
  const checkAnswer = useCallback(async () => {
    if (!currentQuestion || !workspaceRef.current) return;
    try {
      // 비교용 정규화 XML과 저장용 원본 XML을 분리
      const rawXmlText = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current));
      const userXmlText = normalizeXml(rawXmlText);
      const answerXmlText = normalizeXml(currentQuestion.answer);
      const isAnswerCorrect = (userXmlText === answerXmlText);
      setIsCorrect(isAnswerCorrect);

      if (isAnswerCorrect) {
        await submitAnswerToBackend(currentQuestion.id, {
          user_id: userInfo.id,
          session_id: sessionId,
          is_correct: true,
          // 저장은 원본 XML (프리뷰/복원 가능)
          submitted_answer: rawXmlText
        });
        setSolvedQuestions(prev => new Set([...prev, currentQuestion.id]));
        setShowNextButton(true);
      } else {
        await submitAnswerToBackend(currentQuestion.id, {
          user_id: userInfo.id,
          session_id: sessionId,
          is_correct: false,
          // 오답도 원본 XML 저장
          submitted_answer: rawXmlText
        });
      }
    } catch (err) {
      console.error('답안 제출 실패:', err);
      setError('답안을 제출할 수 없습니다.');
    }
  }, [currentQuestion, sessionId, userInfo]);

  // XML 생성 (클립보드 복사)   // XML 변환은 디버깅용  // 관리자 페이지에서 문제 생성, 편집 기능이 생긴다면 유용하게 쓸 거임
  const generateXml = useCallback(() => {
    if (!workspaceRef.current) return;
    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      navigator.clipboard.writeText(xmlText).then(() => {
        alert('XML이 클립보드에 복사되었습니다!');
      }).catch(() => {
        alert('XML:\n' + xmlText);
      });
    } catch (err) {
      console.error('XML 생성 실패:', err);
      alert('XML 생성에 실패했습니다.');
    }
  }, []);

  // Java 코드 생성 (클립보드 복사)
  const generateJavaCode = useCallback(() => {
    if (!workspaceRef.current) return;
    try {
      const javaCode = JavaGenerator.workspaceToCode(workspaceRef.current);
      navigator.clipboard.writeText(javaCode).then(() => {
        alert('Java 코드가 클립보드에 복사되었습니다!');
      }).catch(() => {
        alert('Java 코드:\n' + javaCode);
      });
    } catch (err) {
      console.error('Java 코드 생성 실패:', err);
      alert('Java 코드 생성에 실패했습니다.');
    }
  }, []);

  // 다음 문제로 이동
  const goToNextQuestion = useCallback(async () => {
    if (sessionId) {
      await loadNextQuestion(sessionId);
    }
  }, [sessionId, loadNextQuestion]);

  // 게임 리셋
  const resetGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newSessionId = await generateNewSession();
      setSessionId(newSessionId);
      setSolvedQuestions(new Set());
      setIsCorrect(null);
      setShowNextButton(false);
      setShowCompletionMessage(false);

      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try {
          workspaceRef.current.dispose();
        } catch (err) {
          console.warn('Error disposing workspace during game reset:', err);
        }
        workspaceRef.current = null;
      }

      await loadNextQuestion(newSessionId);
    } catch (err) {
      console.error('게임 리셋 실패:', err);
      setError('게임을 리셋할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [loadNextQuestion]);

  // 블록 초기화
  const resetBlocks = useCallback(() => {
    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try {
        workspaceRef.current.clear();
      } catch (err) {
        console.warn('Error clearing blocks:', err);
      }
    }
    setIsCorrect(null);
    setShowNextButton(false);
  }, []);

  return {
    // refs
    blocklyDivRef,
    workspaceRef,
    // state
    currentQuestion,
    isLoading,
    error,
    sessionId,
    solvedQuestions,
    isCorrect,
    showNextButton,
    showCompletionMessage,
    // derived
    toolbox,
    // actions
    checkAnswer,
    generateXml,
    generateJavaCode,
    goToNextQuestion,
    resetGame,
    resetBlocks,
  };
}

// XML 정규화  // 문제와 답안이 정확히 일치해야 정답으로 취급   // 굳이 비교할 필요없는 속성들은 제거하고 비교해주는게 좋다
function normalizeXml(xmlString) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(xmlString, 'text/xml');
  dom.querySelectorAll('block').forEach(block => {
    block.removeAttribute('id');
    block.removeAttribute('x');
    block.removeAttribute('y');
    block.removeAttribute('deletable');
    block.removeAttribute('movable');
  });
  return new XMLSerializer().serializeToString(dom).replace(/\s+/g, '').trim();
}


