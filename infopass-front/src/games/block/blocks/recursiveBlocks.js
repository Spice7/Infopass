import * as Blockly from "blockly";
import JavaGenerator from "../javaGenerator.js";
import { BLOCK_MESSAGES, BLOCK_COLORS } from "./blockTheme.js"

// ====== [추가] 재귀·오버로딩 문제용 블록들 ======
const RECURSE_BLOCKS = [
    // 메인 컨테이너 (문제에서 가장 바깥 블록으로 사용)
    {
        "type": "main_block",
        "message0": "main %1",
        "args0": [{ "type": "input_statement", "name": "MAIN_BODY" }],
        "colour": "#718093",
        "tooltip": "문제 풀이용 컨테이너 블록(코드 래퍼).",
        "helpUrl": "",
        "previousStatement": null,
        "nextStatement": null
    },

    // value = Integer.valueOf(str);
    {
        "type": "parse_value_from_str",
        "message0": "value = Integer.valueOf(str);",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#786fa6",
        "tooltip": "문자열 str을 정수로 변환해 value에 저장합니다.",
        "helpUrl": ""
    },

    // if (value <= 1) { ... }
    {
        "type": "if_value_le_1",
        "message0": "if (value <= 1) %1 { %2 }",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN_BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#574b90",
        "tooltip": "value가 1 이하이면 THEN_BODY를 실행합니다.",
        "helpUrl": ""
    },

    // return value;
    {
        "type": "return_value",
        "message0": "return value;",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#63cdda",
        "tooltip": "value 값을 반환합니다.",
        "helpUrl": ""
    },

    // return ( LEFT ) + ( RIGHT );
    // LEFT/RIGHT는 '값 입력(input_value)'으로 설계 (호출 블록들을 꽂기 위함)
    {
        "type": "return_add",
        "message0": "return %1 + %2 ;",
        "args0": [
            { "type": "input_value", "name": "LEFT" },
            { "type": "input_value", "name": "RIGHT" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#34ace0",
        "tooltip": "두 재귀 호출의 합을 반환합니다.",
        "helpUrl": ""
    },

    // calc(value - 1)
    {
        "type": "call_calc_minus_1",
        "message0": "calc(value - 1)",
        "output": "Number",
        "colour": "#778beb",
        "tooltip": "정수 오버로드 calc(int) 호출: value-1",
        "helpUrl": ""
    },

    // calc(value - 3)    // 답
    {
        "type": "call_calc_minus_3",
        "message0": "calc(value - 3)",
        "output": "Number",
        "colour": "#3dc1d3",
        "tooltip": "정수 오버로드 calc(int) 호출: value-3 (정답 조합)",
        "helpUrl": ""
    },

    // calc(value - 2)    // 오답 유도용 함정픽
    {
        "type": "call_calc_minus_2",
        "message0": "calc(value - 2)",
        "output": "Number",
        "colour": "#e66767",
        "tooltip": "정수 오버로드 calc(int) 호출: value-2 (혼동 유도)",
        "helpUrl": ""
    }
];

const generateBlocks = () => {
    // ====== [추가] 재귀·오버로딩 문제용 제너레이터 ======
    JavaGenerator.forBlock['main_block'] = function (block) {
        const body = JavaGenerator.statementToCode(block, 'MAIN_BODY');
        // 컨테이너 역할만 수행: 감싸는 코드 없이 내부만 방출 (페이지 템플릿에서 래핑)
        return `${body}`;
    };

    JavaGenerator.forBlock['parse_value_from_str'] = function () {
        return `int value = Integer.valueOf(str);\n`;
    };

    JavaGenerator.forBlock['if_value_le_1'] = function (block) {
        const thenBody = JavaGenerator.statementToCode(block, 'THEN_BODY');
        return `if (value <= 1) {\n${thenBody}}\n`;
    };

    JavaGenerator.forBlock['return_value'] = function () {
        return `return value;\n`;
    };

    JavaGenerator.forBlock['return_add'] = function (block) {
        const left = JavaGenerator.valueToCode(block, 'LEFT', JavaGenerator.ORDER_NONE) || '0';
        const right = JavaGenerator.valueToCode(block, 'RIGHT', JavaGenerator.ORDER_NONE) || '0';
        return `return (${left}) + (${right});\n`;
    };

    JavaGenerator.forBlock['call_calc_minus_1'] = function () {
        return ['calc(value - 1)', JavaGenerator.ORDER_ATOMIC];
    };

    JavaGenerator.forBlock['call_calc_minus_3'] = function () {
        return ['calc(value - 3)', JavaGenerator.ORDER_ATOMIC];
    };

    JavaGenerator.forBlock['call_calc_minus_2'] = function () {
        return ['calc(value - 2)', JavaGenerator.ORDER_ATOMIC];
    };
}

export { RECURSE_BLOCKS, generateBlocks };