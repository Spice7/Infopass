import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { getSingleQuestion } from './BlockAPI.js';
import { JavaGenerator, Blockly, BLOCK_MESSAGES, BLOCK_COLORS } from './index.js';
import Cookies from 'js-cookie'

const BlockMain = ({ questionId = null }) => {
  const [user, setUser] = useState(null);                   // 플레이중인 유저 정보
  const [sessionId, setSessionId] = useState(null);         // 문제 중복 방지를 위한 session
  const blocklyDiv = useRef(null);                          // 화면에 출력할 blockly API 영역
  const workspaceRef = useRef(null);                        // blockly API DOM
  const [result, setResult] = useState("");                 // 유저가 배치한 결과와 정답 비교용
  const [questionData, setQuestionData] = useState(null);   // DB에서 추출해 화면에 출력할 문제
  const [loading, setLoading] = useState(true);             // 로딩 관련
  const [error, setError] = useState(null);                 // 디버깅용   // 배포시 삭제

  // 랜덤 문제 ID 생성 또는 props로 받은 ID 사용  // 백엔드로 옮겨야함
  const getQuestionId = useCallback(() => {
    return questionId || Math.floor(Math.random() * 10) + 1; // 1-10 범위의 랜덤 ID
  }, [questionId]);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const id = getQuestionId();
        const data = await getSingleQuestion(2);  // 일단 하드코딩으로 테스트
        setQuestionData(data);
      } catch (err) {
        setError('문제 데이터를 불러오는데 실패했습니다.');
        console.error('Question fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [getQuestionId]);

  // 툴박스 메모이제이션
  const toolbox = useMemo(() => {
    if (!questionData?.toolbox) return null;

    try {
      const toolboxArray = JSON.parse(questionData.toolbox);
      return {
        kind: "flyoutToolbox",
        contents: toolboxArray.map(type => ({ kind: "block", type }))
      };
    } catch (err) {
      console.error('Toolbox parsing error:', err);
      return null;
    }
  }, [questionData]);

  // 새로운 문제를 받아올 때마다 blockly workspace 최신화
  useEffect(() => {
    if (!questionData?.question_blocks || !blocklyDiv.current || !toolbox) return;

    try {
      // 기존 workspace 정리
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }

      // 새 workspace 생성
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox,
        trashcan: true,
        scrollbars: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        }
      });

      // 초기 블록 배치
      const xml = Blockly.utils.xml.textToDom(questionData.question_blocks);
      Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);

    } catch (err) {
      console.error('Workspace initialization error:', err);
      setError('블록 워크스페이스 초기화에 실패했습니다.');
    }

    // cleanup
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [questionData, toolbox]);

  // xml 형태로 되어 있는 문제와 정답을 화면에 출력 가능한 데이터로
  const normalizeXml = useCallback((xmlString) => {
    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(xmlString, "text/xml");

      // 파싱 에러 체크
      const parserError = dom.querySelector("parsererror");
      if (parserError) {
        throw new Error("XML 파싱 오류");
      }

      // 모든 block 요소에서 id, x, y 속성 제거
      dom.querySelectorAll('block').forEach(block => {
        block.removeAttribute('id');
        block.removeAttribute('x');
        block.removeAttribute('y');
      });

      return new XMLSerializer().serializeToString(dom).replace(/\s+/g, '').trim();
    } catch (err) {
      console.error('XML normalization error:', err);
      return '';
    }
  }, []);

  // 여러 정답을 처리하는 유틸리티 함수
  const parseAnswers = useCallback((answerData) => {
    if (!answerData) return [];
    
    // 배열인 경우
    if (Array.isArray(answerData)) {
      return answerData;
    }
    
    // 문자열인 경우
    if (typeof answerData === 'string') {
      try {
        // JSON 문자열인지 확인
        const parsed = JSON.parse(answerData);
        return Array.isArray(parsed) ? parsed : [answerData];
      } catch {
        // 일반 문자열인 경우 단일 정답으로 처리
        return [answerData];
      }
    }
    
    // 기타 경우
    return [answerData];
  }, []);

  // 정답 비교 함수
  const compareAnswers = useCallback((userXml, answers) => {
    const normalizedUserXml = normalizeXml(userXml);
    
    for (const answer of answers) {
      const normalizedAnswerXml = normalizeXml(answer);
      if (normalizedUserXml === normalizedAnswerXml) {
        return true;
      }
    }
    
    return false;
  }, [normalizeXml]);

  // 정답 체크 (여러 정답 지원)
  const handleCheck = useCallback(() => {
    if (!workspaceRef.current || !questionData?.answer) {
      setResult("오류: 정답 확인을 할 수 없습니다.");
      return;
    }

    try {
      const userXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current));
      const answers = parseAnswers(questionData.answer);
      
      const isCorrect = compareAnswers(userXml, answers);

      if (isCorrect) {
        setResult("🎉 정답입니다!");
      } else {
        setResult("😢 오답입니다. 다시 시도해보세요.");
      }

      // 개발 모드에서만 디버깅 정보 출력
      if (import.meta.env.MODE === 'development') {
        console.log("사용자 XML:", normalizeXml(userXml));
        console.log("정답 XML들:", answers.map(answer => normalizeXml(answer)));
        console.log("정답 개수:", answers.length);
      }
    } catch (err) {
      console.error('Answer check error:', err);
      setResult("오류: 정답 확인 중 문제가 발생했습니다.");
    }
  }, [questionData, parseAnswers, compareAnswers, normalizeXml]);

  // 초기화
  const handleReset = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      // 초기 블록 다시 배치
      if (questionData?.question_blocks) {
        const xml = Blockly.utils.xml.textToDom(questionData.question_blocks);
        Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);
      }
      setResult("");
    }
  }, [questionData]);

  // 개발 환경에서만 XML 내보내기 버튼 표시   // 배포 시 삭제 잊지 말자
  const handleExportXml = useCallback(() => {
    if (workspaceRef.current) {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      console.log(xmlText);
      navigator.clipboard.writeText(xmlText).then(() => {
        alert('XML이 클립보드에 복사되었습니다.');
      });
    }
  }, []);

  // java 코드로 변환 기능
  const handleGenerateJavaCode = () => {
    if (workspaceRef.current) {
      console.log('JavaGenerator 객체:', JavaGenerator);
      console.log('JavaGenerator에 정의된 블록 타입들:', Object.keys(JavaGenerator));
      
      try {
        const javaCode = JavaGenerator.workspaceToCode(workspaceRef.current);
        console.log('생성된 Java 코드:', javaCode);
        navigator.clipboard.writeText(javaCode).then(() => {
          alert('Java 코드가 클립보드에 복사되었습니다.');
        });
      } catch (error) {
        console.error('Java 코드 생성 오류:', error);
        alert('Java 코드 생성 중 오류가 발생했습니다: ' + error.message);
      }
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>문제 데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <div>{error}</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
          다시 시도
        </button>
      </div>
    );
  }

  // 데이터 없음
  if (!questionData) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>문제 데이터가 없습니다.</div>;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        블록 코딩 퀴즈
      </h2>

      <div style={{
        background: '#f0f8ff',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid #e0e0e0'
      }}>
        <strong>문제:</strong> {questionData.question}
      </div>

      <div
        ref={blocklyDiv}
        style={{
          height: "500px",
          width: "100%",
          background: "#f7f7f7",
          margin: "1rem 0",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          border: "1px solid #ddd"
        }}
      />

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={handleCheck}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '0.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          정답 확인
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '0.5rem',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          초기화
        </button>

        {/* 개발 환경에서만 표시 */}
        {import.meta.env.MODE === 'development' && (
          <>
            <button
              onClick={handleExportXml}
              style={{
                padding: '0.75rem 1.5rem',
                marginRight: '0.5rem',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              XML 내보내기
            </button>
            <button
              onClick={handleGenerateJavaCode}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Java 코드 생성
            </button>
          </>
        )}
      </div>

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: result.includes('정답') ? '#e8f5e8' : '#ffe8e8',
          borderRadius: '6px',
          border: `1px solid ${result.includes('정답') ? '#4CAF50' : '#f44336'}`
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default BlockMain;