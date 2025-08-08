import * as Blockly from "blockly";

// Java 코드 생성기 객체 생성
export const JavaGenerator = new Blockly.Generator("Java");

// 기본 코드 조합 규칙      // 연산자 우선 순위 등      // 필요한게 생기면 또 추가
JavaGenerator.ORDER_ATOMIC = 0;     // 가장 높은 우선순위   // 괄호 불필요
JavaGenerator.ORDER_NONE = 99;      // 기본 우선순위       // 괄호 필요할 수 있음

// blockly workspace 전체를 Java 코드로 변환하는 함수
JavaGenerator.workspaceToCode = function (workspace) {
    const code = [];
    const blocks = workspace.getTopBlocks(true);    // 가장 위에 있는 블록들 가져오기

    for (let block of blocks) {
        const line = this.blockToCode(block);   // 블록 → 코드 변환 호출
        // 연산자 우선순위 값이 함께 온 경우 (ex: ['a / b', 0])
        if (Array.isArray(line)) {
            code.push(line[0]);
        // 그냥 문자열로 온 경우
        } else if (line) {
            code.push(line);
        }
    }

    return code.join("\n");
};

// 기본 연결자      // 다음 블록과 연결
JavaGenerator.scrub_ = function (block, code) {
    const nextBlock = block.getNextBlock();
    const nextCode = JavaGenerator.blockToCode(nextBlock);
    return code + (nextCode || "");
};

export default JavaGenerator;