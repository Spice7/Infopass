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

export { BLOCK_MESSAGES, BLOCK_COLORS, BLOCK_MESSAGES_KR }