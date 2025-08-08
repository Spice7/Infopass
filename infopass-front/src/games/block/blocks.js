import * as Blockly from "blockly";

// 블록 메시지 상수 정의  // 추가 블록 생성, 다국어 지원 등 확장성 고려
const BLOCK_MESSAGES = {
  TRY_BLOCK: "try",
  CATCH_ARITHMETIC: "catch(ArithmeticException e)",
  CATCH_ARRAYINDEX: "catch(ArrayIndexOutOfBoundsException e)",
  CATCH_NUMBERFORMAT: "catch(NumberFormatException e)",
  CATCH_EXCEPTION: "catch(Exception e)",
  FINALLY_BLOCK: "finally",
  PRINT_STATEMENT: "System.out.print",
  DIVIDE_STATEMENT: "a / b",

  // OUTPUT
  OUTPUT_ARITHMETIC_ERROR: "산술 연산 오류",
  OUTPUT_ARRAY_ERROR: "배열 인덱스 오류",
  OUTPUT_FORMAT_ERROR: "숫자 형식 오류",
  OUTPUT_GENERAL_ERROR: "일반 예외 발생",
  OUTPUT_FINALLY: "정리 작업"
};

// 다국어 지원 예시   // 확장성만 고려했을 뿐 실제로 지원하진 않음  // 시간나면 추가
const BLOCK_MESSAGES_KR = {
  TRY_BLOCK: "시도"
}

// 색상 테마 정의
const BLOCK_COLORS = {
  TRY_CATCH: "#FF6B6B",       // 빨간색 계열
  EXCEPTION: "#4ECDC4",       // 청록색 계열  
  FINALLY: "#45B7D1",         // 파란색 계열
  STATEMENT: "#96CEB4",       // 초록색 계열
  OUTPUT: "#FFEAA7"           // 노란색 계열
};

// 커스텀 블록 정의
const blockDefinitions = [
  {
    "type": "try_block",
    "message0": `${BLOCK_MESSAGES.TRY_BLOCK} %1`,
    "args0": [
      {
        "type": "input_statement",
        "name": "TRY_BODY",
        "check": null
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.TRY_CATCH,
    "tooltip": "try 블록 - 예외가 발생할 수 있는 코드를 감쌉니다.",
    "helpUrl": ""   // 우클릭시 설명창을 띄워줄 외부 링크로 연결 가능
  },
  {
    "type": "catch_arithmetic",
    "message0": `${BLOCK_MESSAGES.CATCH_ARITHMETIC} %1 { %2 }`,
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "CATCH_BODY"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.EXCEPTION,
    "tooltip": "ArithmeticException을 처리합니다 (0으로 나누기 등).",
    "helpUrl": ""
  },
  {
    "type": "catch_arrayindex",
    "message0": `${BLOCK_MESSAGES.CATCH_ARRAYINDEX} %1 { %2 }`,
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "CATCH_BODY"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.EXCEPTION,
    "tooltip": "ArrayIndexOutOfBoundsException을 처리합니다.",
    "helpUrl": ""
  },
  {
    "type": "catch_numberformat",
    "message0": `${BLOCK_MESSAGES.CATCH_NUMBERFORMAT} %1 { %2 }`,
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "CATCH_BODY"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.EXCEPTION,
    "tooltip": "NumberFormatException을 처리합니다.",
    "helpUrl": ""
  },
  {
    "type": "catch_exception",
    "message0": `${BLOCK_MESSAGES.CATCH_EXCEPTION} %1 { %2 }`,
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "CATCH_BODY"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.EXCEPTION,
    "tooltip": "모든 Exception을 처리합니다 (가장 일반적인 예외 처리).",
    "helpUrl": ""
  },
  {
    "type": "finally_block",
    "message0": `${BLOCK_MESSAGES.FINALLY_BLOCK} %1`,
    "args0": [
      {
        "type": "input_statement",
        "name": "FINALLY_BODY"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.FINALLY,
    "tooltip": "finally 블록 - 예외 발생 여부와 관계없이 항상 실행됩니다.",
    "helpUrl": ""
  },
  {
    "type": "print_statement",
    "message0": `${BLOCK_MESSAGES.PRINT_STATEMENT}(%1)`,
    "args0": [
      {
        "type": "field_input",
        "name": "PRINT_TEXT",
        "text": "메시지를 입력하세요"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": BLOCK_COLORS.STATEMENT,
    "tooltip": "콘솔에 텍스트를 출력합니다.",
    "helpUrl": ""
  },
  {
    "type": "divide_statement",
    "message0": BLOCK_MESSAGES.DIVIDE_STATEMENT,
    "output": "Number",
    "colour": BLOCK_COLORS.OUTPUT,
    "tooltip": "두 수를 나누는 연산입니다. 0으로 나누면 ArithmeticException이 발생합니다.",
    "helpUrl": ""
  },

  // 추가 유용한 블록들   // 여기서부턴 AI가 추천한 블록들
  {
    "type": "array_access",
    "message0": "배열[%1]",
    "args0": [
      {
        "type": "field_number",
        "name": "INDEX",
        "value": 0,
        "min": 0
      }
    ],
    "output": null,
    "colour": BLOCK_COLORS.OUTPUT,
    "tooltip": "배열의 특정 인덱스에 접근합니다. 잘못된 인덱스는 ArrayIndexOutOfBoundsException을 발생시킵니다.",
    "helpUrl": ""
  },
  {
    "type": "parse_int",
    "message0": "Integer.parseInt(%1)",
    "args0": [
      {
        "type": "field_input",
        "name": "STRING_VALUE",
        "text": "123"
      }
    ],
    "output": "Number",
    "colour": BLOCK_COLORS.OUTPUT,
    "tooltip": "문자열을 정수로 변환합니다. 잘못된 형식은 NumberFormatException을 발생시킵니다.",
    "helpUrl": ""
  }
];

// 위에 정의한 커스텀 블록들을 Blockly에 등록
Blockly.defineBlocksWithJsonArray(blockDefinitions);

// Java 코드 생성기 정의
if (Blockly.Java) {
  // Try 블록 코드 생성
  Blockly.Java['try_block'] = function (block) {
    const statements_try = Blockly.Java.statementToCode(block, 'TRY_BODY');
    return `try {\n${statements_try}} `;
  };

  // Catch 블록들 코드 생성
  ['catch_arithmetic', 'catch_arrayindex', 'catch_numberformat', 'catch_exception'].forEach(blockType => {
    Blockly.Java[blockType] = function (block) {
      const statements_catch = Blockly.Java.statementToCode(block, 'CATCH_BODY');
      const exceptionType = blockType.replace('catch_', '');
      return `catch (${exceptionType}) {\n${statements_catch}} `;
    };
  });

  // Finally 블록 코드 생성
  Blockly.Java['finally_block'] = function (block) {
    const statements_finally = Blockly.Java.statementToCode(block, 'FINALLY_BODY');
    return `finally {\n${statements_finally}} `;
  };

  // Print 문 코드 생성
  Blockly.Java['print_statement'] = function (block) {
    const text = block.getFieldValue('PRINT_TEXT');
    return `System.out.print("${text}");\n`;
  };

  // 나누기 연산 코드 생성
  Blockly.Java['divide_statement'] = function (block) {
    return ['a / b', Blockly.Java.ORDER_MULTIPLICATIVE];
  };

  // 배열 접근 코드 생성
  Blockly.Java['array_access'] = function (block) {
    const index = block.getFieldValue('INDEX');
    return [`array[${index}]`, Blockly.Java.ORDER_MEMBER];
  };

  // parseInt 코드 생성
  Blockly.Java['parse_int'] = function (block) {
    const stringValue = block.getFieldValue('STRING_VALUE');
    return [`Integer.parseInt("${stringValue}")`, Blockly.Java.ORDER_FUNCTION_CALL];
  };
}

// 블록 유효성 검사 함수
// 잘못 사용 된 블럭이 있다면 오류 메세지 전달
export const validateBlockStructure = (workspace) => {
  const blocks = workspace.getAllBlocks();
  const errors = [];

  blocks.forEach(block => {
    switch (block.type) {
      case 'try_block':
        if (!block.getInputTargetBlock('TRY_BODY')) {
          errors.push('Try 블록에 내용이 필요합니다.');
        }
        break;
      case 'finally_block':
        if (!block.getInputTargetBlock('FINALLY_BODY')) {
          errors.push('Finally 블록에 내용이 필요합니다.');
        }
        break;
      default:
        break;
    }
  });

  return errors;
};

// 블록 타입별 설명 제공
export const getBlockDescription = (blockType) => {
  const descriptions = {
    'try_block': 'Try 블록은 예외가 발생할 수 있는 코드를 감싸는 데 사용됩니다.',
    'catch_arithmetic': 'ArithmeticException을 잡아 처리합니다. 주로 0으로 나누기 오류에서 발생합니다.',
    'catch_arrayindex': 'ArrayIndexOutOfBoundsException을 처리합니다. 배열의 잘못된 인덱스 접근 시 발생합니다.',
    'catch_numberformat': 'NumberFormatException을 처리합니다. 문자열을 숫자로 변환할 때 발생할 수 있습니다.',
    'catch_exception': '모든 종류의 Exception을 처리하는 가장 일반적인 예외 처리 블록입니다.',
    'finally_block': 'Finally 블록은 예외 발생 여부와 관계없이 항상 실행되는 코드입니다.',
    'print_statement': '콘솔에 메시지를 출력하는 블록입니다.',
    'divide_statement': '나누기 연산을 수행합니다. 분모가 0이면 예외가 발생합니다.'
  };

  return descriptions[blockType] || '설명이 없습니다.';
};

// 블록 카테고리 정의 (향후 확장용)
export const BLOCK_CATEGORIES = {
  CONTROL: ['try_block', 'finally_block'],
  EXCEPTIONS: ['catch_arithmetic', 'catch_arrayindex', 'catch_numberformat', 'catch_exception'],
  STATEMENTS: ['print_statement', 'divide_statement', 'array_access', 'parse_int']
};

export { BLOCK_MESSAGES, BLOCK_COLORS };
export default Blockly;