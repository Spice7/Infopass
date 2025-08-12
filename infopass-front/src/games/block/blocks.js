import * as Blockly from "blockly";
import { BLOCK_DEFINITIONS, blockRegister } from "./blocks/index.js";
import JavaGenerator from "./javaGenerator.js";


// 위에 정의한 커스텀 블록들을 Blockly에 등록

export const registerAllBlocks = () => {
  Blockly.defineBlocksWithJsonArray(BLOCK_DEFINITIONS);

  blockRegister();
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
    'divide_statement': '나누기 연산을 수행합니다. 분모가 0이면 예외가 발생합니다.',
    'main_block': '풀이용 컨테이너 블록입니다. 내부 MAIN_BODY에 블록들을 올바른 순서/구조로 배치하세요.',
    'parse_value_from_str': '문자열 매개변수 str을 정수로 변환하여 value에 대입합니다.',
    'if_value_le_1': 'value가 1 이하일 때 분기합니다. 보통 재귀의 기저 조건으로 사용합니다.',
    'return_value': 'value 값을 반환합니다.',
    'return_add': '두 재귀 호출 결과를 더해 반환합니다.',
    'call_calc_minus_1': 'calc(int) 오버로드를 value-1로 호출합니다.',
    'call_calc_minus_3': 'calc(int) 오버로드를 value-3으로 호출합니다.',
    'call_calc_minus_2': 'calc(int) 오버로드를 value-2로 호출합니다.',
  };

  return descriptions[blockType] || '설명이 없습니다.';
};

// 블록 카테고리 정의 (향후 확장용)
export const BLOCK_CATEGORIES = {
  CONTROL: ['try_block', 'finally_block', 'main_block', 'if_value_le_1'],
  EXCEPTIONS: ['catch_arithmetic', 'catch_arrayindex', 'catch_numberformat', 'catch_exception'],
  STATEMENTS: ['print_statement', 'divide_statement', 'array_access', 'parse_int', 'parse_value_from_str', 'return_value', 'return_add', 'call_calc_minus_1', 'call_calc_minus_2', 'call_calc_minus_3']
};

export { JavaGenerator };
export default Blockly;