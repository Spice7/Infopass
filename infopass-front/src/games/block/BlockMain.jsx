import React, { useState, useEffect, useMemo, useRef, useContext, useCallback } from 'react';
import * as Blockly from 'blockly';
import { registerAllBlocks } from './blocks';
import { JavaGenerator } from './javaGenerator';
import { LoginContext } from '../../user/LoginContextProvider';
import { getRandomUnsolvedQuestion, generateNewSession, submitAnswerToBackend } from './BlockAPI';
import BlockLoading from './loading/BlockLoading';

const BlockMain = () => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const { userInfo } = useContext(LoginContext);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [solvedQuestions, setSolvedQuestions] = useState(new Set());
  const [isCorrect, setIsCorrect] = useState(null); // null로 초기화
  const [showNextButton, setShowNextButton] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // 블록 등록
  useEffect(() => {
    registerAllBlocks();
  }, []);

  // 툴박스 설정 (기존 방식과 동일)
  const toolbox = useMemo(() => {
    console.log('Toolbox useMemo triggered, currentQuestion:', currentQuestion);
    
    if (!currentQuestion) {
      console.log('No currentQuestion, toolbox is null');
      return null;
    }
    
    try {
      const toolboxArray = JSON.parse(currentQuestion.toolbox);
      console.log('Toolbox array parsed:', toolboxArray);
      
      const result = {
        kind: "flyoutToolbox",
        contents: toolboxArray.map(type => ({ kind: "block", type }))
      };
      
      console.log('Toolbox created:', result);
      return result;
    } catch (e) {
      console.error('Toolbox parsing error:', e);
      return null;
    }
  }, [currentQuestion]);

  // 다음 문제 로드 (의존 훅보다 위에서 선언하여 TDZ 회피)
  const loadNextQuestion = useCallback(async (currentSessionId) => {
    setIsLoading(true);
    try {
      console.log('Loading next question for session:', currentSessionId);
      if (!userInfo || !userInfo.id) {
        console.error('No userInfo or userInfo.id available');
        setError('사용자 인증이 필요합니다.');
        return;
      }

      const question = await getRandomUnsolvedQuestion(userInfo.id, currentSessionId);
      console.log('Question loaded:', question);
      
      if (!question) {
        // 모든 문제를 완료한 경우
        console.log('All questions completed');
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

  // 사용자 정보 로드 후 게임 초기화
  useEffect(() => {
    console.log('userInfo changed:', userInfo);
    if (!userInfo) return; // 사용자 정보가 로드될 때까지 대기

    const initializeGame = async () => {
      try {
        console.log('Starting game initialization...');
        setIsLoading(true);
        setError(null);
        
        // 새 세션 생성
        const newSessionId = await generateNewSession();
        console.log('New session created:', newSessionId);
        setSessionId(newSessionId);
        setSolvedQuestions(new Set());
        setIsCorrect(null); // null로 설정
        setShowNextButton(false);
        setShowCompletionMessage(false);
        
        // 첫 문제 로드
        await loadNextQuestion(newSessionId);
      } catch (err) {
        console.error('게임 초기화 실패:', err);
        setError('게임을 초기화할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [userInfo, loadNextQuestion]); // userInfo가 변경될 때마다 실행

  // Blockly workspace 초기화
  useEffect(() => {
    console.log('Blockly workspace useEffect triggered:', {
      currentQuestion: !!currentQuestion,
      questionBlocks: !!currentQuestion?.question_blocks,
      blocklyDiv: !!blocklyDiv.current,
      toolbox: !!toolbox
    });
    
    if (!currentQuestion || !currentQuestion.question_blocks || !blocklyDiv.current || !toolbox) {
      console.log('Blockly workspace initialization skipped - missing dependencies');
      return;
    }

    console.log('Initializing Blockly workspace...');
    
    // 기존 workspace가 있다면 안전하게 제거
    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try {
        workspaceRef.current.dispose();
        console.log('Previous workspace disposed successfully');
      } catch (err) {
        console.warn('Error disposing previous workspace:', err);
      }
      workspaceRef.current = null;
    }

    // Blockly workspace 생성 (기존 방식)
    try {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        trashcan: true,
        scrollbars: true,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });

      // 초기 블록 로드
      const xml = Blockly.utils.xml.textToDom(currentQuestion.question_blocks);
      Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);
      console.log('Blockly workspace initialized successfully');
    } catch (e) {
      console.error('Blockly workspace initialization error:', e);
      workspaceRef.current = null;
    }

    // cleanup
    return () => {
      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try {
          workspaceRef.current.dispose();
          console.log('Workspace cleanup successful');
        } catch (err) {
          console.warn('Error during workspace cleanup:', err);
        }
        workspaceRef.current = null;
      }
    };
  }, [currentQuestion, toolbox]);


  // 정답 체크
  const checkAnswer = async () => {
    if (!currentQuestion || !workspaceRef.current) return;

    try {
      // XML 기반 정답 체크
      const userXmlText = normalizeXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current)));
      const answerXmlText = normalizeXml(currentQuestion.answer);
      
      const isAnswerCorrect = (userXmlText === answerXmlText);
      setIsCorrect(isAnswerCorrect);

      console.log("정답 체크 시도");

      if (isAnswerCorrect) {
        console.log("정답");

        // 정답인 경우: 답안 제출 기록 저장 및 다음 문제 버튼 표시
        await submitAnswerToBackend(currentQuestion.id, {
          user_id: userInfo.id,
          session_id: sessionId,
          is_correct: true,
          submitted_answer: userXmlText
        });

        console.log("정답 입력 후 백엔드 통신 완료");

        // 현재 문제를 해결된 문제 목록에 추가
        setSolvedQuestions(prev => new Set([...prev, currentQuestion.id]));
        setShowNextButton(true);
      } else {
        console.log("오답");
        // 오답인 경우: 답안 제출 기록만 저장하고 같은 문제 유지
        await submitAnswerToBackend(currentQuestion.id, {
          user_id: userInfo.id,
          session_id: sessionId,
          is_correct: false,
          submitted_answer: userXmlText
        });

        console.log("오답 입력 후 백엔드 통신 완료");
      }
    } catch (err) {
      console.error('답안 제출 실패:', err);
      setError('답안을 제출할 수 없습니다.');
    }
  };

  // XML 정규화
  const normalizeXml = (xmlString) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xmlString, "text/xml");

    // 모든 block 요소에서 id, x, y 속성 제거
    dom.querySelectorAll('block').forEach(block => {
      block.removeAttribute('id');
      block.removeAttribute('x');
      block.removeAttribute('y');
      block.removeAttribute('deletable');
      block.removeAttribute('movable');
    });

    // 문자열로 변환 후 공백/줄바꿈 제거
    return new XMLSerializer().serializeToString(dom).replace(/\s+/g, '').trim();
  };

  // XML 생성
  const generateXml = () => {
    if (!workspaceRef.current) return;
    
    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      console.log('Generated XML:', xmlText);
      
      // 클립보드에 복사
      navigator.clipboard.writeText(xmlText).then(() => {
        alert('XML이 클립보드에 복사되었습니다!');
      }).catch(() => {
        // 클립보드 복사 실패 시 alert로 표시
        alert('XML:\n' + xmlText);
      });
    } catch (err) {
      console.error('XML 생성 실패:', err);
      alert('XML 생성에 실패했습니다.');
    }
  };

  // Java 코드 생성
  const generateJavaCode = () => {
    if (!workspaceRef.current) return;
    
    try {
      const javaCode = JavaGenerator.workspaceToCode(workspaceRef.current);
      console.log('Generated Java Code:', javaCode);
      
      // 클립보드에 복사
      navigator.clipboard.writeText(javaCode).then(() => {
        alert('Java 코드가 클립보드에 복사되었습니다!');
      }).catch(() => {
        // 클립보드 복사 실패 시 alert로 표시
        alert('Java 코드:\n' + javaCode);
      });
    } catch (err) {
      console.error('Java 코드 생성 실패:', err);
      alert('Java 코드 생성에 실패했습니다.');
    }
  };

  // 다음 문제로 이동
  const goToNextQuestion = async () => {
    if (sessionId) {
      await loadNextQuestion(sessionId);
    }
  };

  // 게임 리셋
  const resetGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 새 세션 생성
      const newSessionId = await generateNewSession();
      setSessionId(newSessionId);
      setSolvedQuestions(new Set());
      setIsCorrect(null);
      setShowNextButton(false);
      setShowCompletionMessage(false);
      
      // 워크스페이스 안전하게 초기화
      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try {
          workspaceRef.current.dispose();
          console.log('Workspace disposed during game reset');
        } catch (err) {
          console.warn('Error disposing workspace during game reset:', err);
        }
        workspaceRef.current = null;
      }
      
      // 첫 문제 로드
      await loadNextQuestion(newSessionId);
    } catch (err) {
      console.error('게임 리셋 실패:', err);
      setError('게임을 리셋할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 블록 초기화
  const resetBlocks = () => {
    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try {
        workspaceRef.current.clear();
        console.log('Blocks cleared successfully');
      } catch (err) {
        console.warn('Error clearing blocks:', err);
      }
    }
    setIsCorrect(null);
    setShowNextButton(false);
  };

  if (isLoading) {
    return <BlockLoading />;
  }

  if (!userInfo) {
    return (
      <div className="error">
        <p>로그인이 필요합니다.</p>
        <p>로그인 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={resetGame}>다시 시도</button>
      </div>
    );
  }

  // 디버깅 정보 표시 (개발 중에만)
  console.log('Render state:', {
    currentQuestion,
    isCorrect,
    showNextButton,
    showCompletionMessage,
    sessionId
  });

  if (showCompletionMessage) {
    return (
      <div className="completion-message">
        <h2>🎉 모든 문제를 완료했습니다!</h2>
        <p>축하합니다! 모든 문제를 성공적으로 해결하셨습니다.</p>
        <button onClick={resetGame}>새 게임 시작</button>
      </div>
    );
  }

  return (
    <div className="block-main">
      <div className="header">
        <h1>블록 코딩 게임</h1>
        <div className="controls">
          <button onClick={resetGame} className="reset-game-btn">
            게임 초기화
          </button>
        </div>
      </div>

      {currentQuestion && (
        <div className="question-section">
          <h2>문제</h2>
          <p>{currentQuestion.question}</p>
          <div className="question-info">
            <span>카테고리: {currentQuestion.category}</span><br></br>
            <span>해결된 문제: {solvedQuestions.size}개</span>
          </div>
        </div>
      )}

      <div className="workspace-section">
        <div 
          ref={blocklyDiv} 
          className="blockly-workspace"
          style={{
            width: '100%',
            height: '500px',
            border: '2px solid #ccc',
            backgroundColor: '#f9f9f9',
            position: 'relative'
          }}
        ></div>
      </div>

      <div className="action-section">
        {!showNextButton ? (
          <div className="action-buttons">
            <button 
              onClick={checkAnswer} 
              className="check-answer-btn"
              disabled={!currentQuestion}
            >
              정답체크
            </button>
            <div className="code-generation-buttons">
              <button onClick={generateXml} className="generate-xml-btn">XML 생성</button>
              <button onClick={generateJavaCode} className="generate-java-btn">Java 코드 생성</button>
            </div>
            <button onClick={resetBlocks} className="reset-blocks-btn">
              블록 초기화
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button 
              onClick={goToNextQuestion} 
              className="next-question-btn"
            >
              다음 문제
            </button>
            <button onClick={resetBlocks} className="reset-blocks-btn">
              블록 초기화
            </button>
          </div>
        )}
      </div>

      {isCorrect && (
        <div className="result-message correct">
          <p>🎉 정답입니다!</p>
        </div>
      )}

      {!isCorrect && currentQuestion && isCorrect !== null && (
        <div className="result-message incorrect">
          <p>❌ 오답입니다. 다시 시도해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default BlockMain;