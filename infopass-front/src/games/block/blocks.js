import * as Blockly from "blockly";

Blockly.defineBlocksWithJsonArray([
    {
        "type": "try_block",
        "message0": "try %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "TRY_BODY"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 200
    },
    {
        "type": "catch_arithmetic",
        "message0": "catch(ArithmeticException e) { System.out.print('출력1'); }",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20
    },
    {
        "type": "catch_arrayindex",
        "message0": "catch(ArrayIndexOutOfBoundsException e) { System.out.print('출력2'); }",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20
    },
    {
        "type": "catch_numberformat",
        "message0": "catch(NumberFormatException e) { System.out.print('출력3'); }",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20
    },
    {
        "type": "catch_exception",
        "message0": "catch(Exception e) { System.out.print('출력4'); }",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20
    },
    {
        "type": "finally_block",
        "message0": "finally %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "FINALLY_BODY"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120
    },
    {
        "type": "print_statement",
        "message0": "System.out.print(%1)",
        "args0": [
            {
                "type": "field_input",
                "name": "PRINT_TEXT",
                "text": ""
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 60
    },
    {
        "type": "divide_statement",
        "message0": "a / b",
        "output": null,
        "colour": 230
    }
]);

export default Blockly;