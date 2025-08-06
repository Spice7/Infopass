import React, { useRef, useState, useEffect } from 'react'
import Blockly from './blocks.js'
import { getSingleQuestion } from './BlockAPI.js';

/// 블록 배치 게임
/// Blockly API 사용

// block.js에 등록한 커스텀 블록을 매핑
const toolbox = {
  "kind": "flyoutToolbox",
  "contents": [
    { "kind": "block", "type": "try_block" },
    { "kind": "block", "type": "catch_arithmetic" },
    { "kind": "block", "type": "catch_arrayindex" },
    { "kind": "block", "type": "catch_numberformat" },
    { "kind": "block", "type": "catch_exception" },
    { "kind": "block", "type": "finally_block" },
    { "kind": "block", "type": "print_statement" },
    { "kind": "block", "type": "divide_statement" }
  ]
};

const BlockMain = () => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [result, setResult] = useState("");
  const [questionData, setQuestionData] = useState(null);

  useEffect(() => {
    const fetchQuestionData = async () => {
      const data = await getSingleQuestion(2);
      setQuestionData(data);
      // 백엔드에서 받아온 XML 데이터로 설정
    };

    fetchQuestionData();
  }, []);

  useEffect(() => {
    if (!questionData || !questionData.question_blocks || !blocklyDiv.current) return;

    // Blockly workspace 생성
    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox,
      trashcan: true,
      scrollbars: true
    });

    // 초기 블록 배치
    const xml = Blockly.utils.xml.textToDom(questionData.question_blocks);
    Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);

    // cleanup (컴포넌트 언마운트 시 workspace 제거)  // 내일 왜 해주는건지 찾아보자
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, [questionData]);  // 의존성: questionData만  // initialxml까지 넣으면 null이 될때 아무것도 안나온다

  // const normalizeXml = (xmlString) => {
  //   const dom = Blockly.utils.xml.textToDom(xmlString);
  //   return Blockly.Xml.domToText(dom).trim(); // 줄 바꿈/공백 제거
  // };

  const normalizeXml = (xmlString) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xmlString, "text/xml");

    // 모든 block 요소에서 id, x, y 속성 제거
    dom.querySelectorAll('block').forEach(block => {
      block.removeAttribute('id');
      block.removeAttribute('x');
      block.removeAttribute('y');
    });

    // 문자열로 변환 후 공백/줄바꿈 제거
    return new XMLSerializer().serializeToString(dom).replace(/\s+/g, '').trim();
  };


  // 정답 체크 메소드
  // const isCorrect = () => {
  //   const userXmlText = normalizeXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current)));
  //   const answerXmlText = normalizeXml(questionData.answer);

  //   return userXmlText === answerXmlText;
  // }

  // 정답 체크 메소드
  const handleCheck = () => {
    const userXmlText = normalizeXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current)));
    const answerXmlText = normalizeXml(questionData.answer);

    if (userXmlText === answerXmlText) {
      setResult("정답입니다! 🎉");
    } else {
      setResult("오답입니다. 😢");
    }

    console.log("사용자 XML:", userXmlText);
    console.log("정답 XML:", answerXmlText);
    console.log("일치? ", userXmlText === answerXmlText);
  };

  if (!questionData) {
    return <div>데이터 로딩중</div>;
  }

  // console.log(questionData);
  // console.log(questionData.question);
  // console.log(questionData.question_blocks);
  // console.log(questionData.answer);

  const handleExportXml = () => {
    if (workspaceRef.current) {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      console.log(xmlText); // 혹은 setState로 보여주기
      alert(xmlText);       // 팝업으로 보기
    }
  };

  return (
    <div>
      <h2>예외 처리 블록 퀴즈</h2>
      <p>
        <b>
          {questionData.question}
        </b>
      </p>
      <div ref={blocklyDiv} style={{
        height: "500px",
        width: "1200px",
        background: "#f7f7f7",
        margin: "0 auto",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)"
      }} />
      <button onClick={handleCheck} style={{ marginTop: 16 }}>정답 확인</button>
      <div style={{ marginTop: 16, fontWeight: "bold" }}>{result}</div>
      <button onClick={handleExportXml}>XML 내보내기</button>
    </div>
  )
}

export default BlockMain
