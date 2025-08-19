import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

// 테스트
const explanationFromDB = `
## 개요
이 문제는 0으로 나누기 상황에서 발생하는 \`ArithmeticException\`을 처리하는 방법을 묻고 있습니다.

## 정답 로직
1. try 블록에서 \`a / b\` 실행
2. b가 0일 때 \`ArithmeticException\` 발생
3. catch(ArithmeticException e) 블록으로 처리
4. finally 블록은 항상 실행됨

## 흔한 실수
- Exception으로 포괄 처리하는 경우
- 다른 예외(ArrayIndex 등) 사용

## 한줄 요약
0으로 나누기 예외는 \`catch(ArithmeticException e)\`로 처리해야 합니다.
`;

function ExplanationPanel({ explanationMd }) {
    return (
        <Paper
            elevation={2}
            sx={{
                padding: 3,
                backgroundColor: "#fafafa",
                maxWidth: "800px",
                margin: "20px auto",
            }}
        >
            {/* 제목 */}
            <Typography variant="h5" gutterBottom>
                AI 해설
            </Typography>

            {/* Markdown 렌더링 */}
            <Box sx={{ typography: "body1" }}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {explanationMd}
                </ReactMarkdown>
            </Box>
        </Paper>
    );
}

export default function BlockExplanation() {
  return <ExplanationPanel explanationMd={explanationFromDB} />;
}