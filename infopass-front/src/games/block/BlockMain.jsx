import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import Blockly from './blocks.js'
import { getSingleQuestion } from './BlockAPI.js';

const BlockMain = ({ questionId = null }) => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [result, setResult] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 랜덤 문제 ID 생성 또는 props로 받은 ID 사용
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

  const handleCheck = useCallback(() => {
    if (!workspaceRef.current || !questionData?.answer) {
      setResult("오류: 정답 확인을 할 수 없습니다.");
      return;
    }

    try {
      const userXmlText = normalizeXml(
        Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current))
      );
      const answerXmlText = normalizeXml(questionData.answer);

      if (userXmlText === answerXmlText) {
        setResult("🎉 정답입니다!");
      } else {
        setResult("😢 오답입니다. 다시 시도해보세요.");
      }

      // 개발 모드에서만 디버깅 정보 출력
      if (import.meta.env.MODE === 'development') {
        console.log("사용자 XML:", userXmlText);
        console.log("정답 XML:", answerXmlText);
      }
    } catch (err) {
      console.error('Answer check error:', err);
      setResult("오류: 정답 확인 중 문제가 발생했습니다.");
    }
  }, [questionData, normalizeXml]);

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

  // 개발 환경에서만 XML 내보내기 버튼 표시
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

  // Java 코드 생성 기능 추가
  const handleGenerateJavaCode = useCallback(() => {
    if (workspaceRef.current && Blockly.Java) {
      try {
        const javaCode = Blockly.Java.workspaceToCode(workspaceRef.current);
        console.log('생성된 Java 코드:', javaCode);
        navigator.clipboard.writeText(javaCode).then(() => {
          alert('Java 코드가 클립보드에 복사되었습니다.');
        });
      } catch (error) {
        console.error('Java 코드 생성 오류:', error);
        alert('Java 코드 생성 중 오류가 발생했습니다.');
      }
    } else {
      alert('Java 코드 생성기가 사용할 수 없습니다.');
    }
  }, []);

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