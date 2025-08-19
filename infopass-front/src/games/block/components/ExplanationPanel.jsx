import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

function resolvePublicPath(path) {
    if (!path) return null;
    if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
    return `${import.meta.env.BASE_URL}${path}`;
}

export default function ExplanationPanel({ imagePath, explanationMd }) {
    const resolvedImageSrc = resolvePublicPath(imagePath);
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
            <Typography variant="h5" gutterBottom>
                AI 해설
            </Typography>

            {resolvedImageSrc && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img
                        src={resolvedImageSrc}
                        alt="해설 이미지"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                    />
                </Box>
            )}

            <Box sx={{ typography: "body1" }}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {explanationMd || ''}
                </ReactMarkdown>
            </Box>
        </Paper>
    );
}