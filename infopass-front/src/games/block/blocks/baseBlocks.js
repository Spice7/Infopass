import * as Blockly from "blockly";
import JavaGenerator from "../javaGenerator.js";
import { BLOCK_MESSAGES, BLOCK_COLORS } from "./blockTheme.js"

// 커스텀 블록 정의
const BASE_BLOCKS = [
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

    // 추가 유용한 블록들   // 여기서부턴 AI가 추천한 블록들  // 신PT
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

const generateBlocks = () => {
    // try 블록
    JavaGenerator.forBlock['try_block'] = function (block) {
        const statements_try = JavaGenerator.statementToCode(block, 'TRY_BODY');
        return `try {\n${statements_try}}`;
    };

    // catch 블록
    JavaGenerator.forBlock['catch_arithmetic'] = function (block) {
        const statements_catch = JavaGenerator.statementToCode(block, 'CATCH_BODY');
        return `catch (ArithmeticException e) {\n${statements_catch}}`;
    };

    // catch arrayindex 블록
    JavaGenerator.forBlock['catch_arrayindex'] = function (block) {
        const statements_catch = JavaGenerator.statementToCode(block, 'CATCH_BODY');
        return `catch (ArrayIndexOutOfBoundsException e) {\n${statements_catch}}`;
    };

    // catch numberformat 블록
    JavaGenerator.forBlock['catch_numberformat'] = function (block) {
        const statements_catch = JavaGenerator.statementToCode(block, 'CATCH_BODY');
        return `catch (NumberFormatException e) {\n${statements_catch}}`;
    };

    // catch exception 블록
    JavaGenerator.forBlock['catch_exception'] = function (block) {
        const statements_catch = JavaGenerator.statementToCode(block, 'CATCH_BODY');
        return `catch (Exception e) {\n${statements_catch}}`;
    };

    // finally 블록
    JavaGenerator.forBlock['finally_block'] = function (block) {
        const statements_finally = JavaGenerator.statementToCode(block, 'FINALLY_BODY');
        return `finally {\n${statements_finally}}`;
    };

    // print
    JavaGenerator.forBlock['print_statement'] = function (block) {
        const text = block.getFieldValue('PRINT_TEXT');
        return `System.out.print("${text}");\n`;
    };

    // 나누기
    JavaGenerator.forBlock['divide_statement'] = function () {
        return ['a / b', JavaGenerator.ORDER_ATOMIC];
    };

    // 배열 접근
    JavaGenerator.forBlock['array_access'] = function (block) {
        const index = block.getFieldValue('INDEX');
        return [`array[${index}]`, JavaGenerator.ORDER_ATOMIC];
    };

    // 문자열을 정수로 변환
    JavaGenerator.forBlock['parse_int'] = function (block) {
        const stringValue = block.getFieldValue('STRING_VALUE');
        return [`Integer.parseInt("${stringValue}")`, JavaGenerator.ORDER_ATOMIC];
    };
}

export { BASE_BLOCKS, generateBlocks };