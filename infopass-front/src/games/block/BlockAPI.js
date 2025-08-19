import axios from 'axios';
import securedApi from '../../user/api';

// API 설정
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9000",
    timeout: 10000, // 10초 타임아웃
    headers: {
        'Content-Type': 'application/json',
    }
});

// 요청 인터셉터 (로깅, 인증 토큰 추가 등)
api.interceptors.request.use(
    (config) => {
        // 개발 환경에서만 로깅
        if (import.meta.env.MODE === 'development') {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 에러 로깅
        if (import.meta.env.MODE === 'development') {
            console.error('API Error:', error);
        }

        // 네트워크 에러
        if (!error.response) {
            throw new Error('네트워크 연결을 확인해주세요.');
        }

        // HTTP 상태 코드별 에러 처리
        switch (error.response.status) {
            case 400:
                throw new Error('잘못된 요청입니다.');
            case 401:
                throw new Error('인증이 필요합니다.');
            case 403:
                throw new Error('접근 권한이 없습니다.');
            case 404:
                throw new Error('요청한 데이터를 찾을 수 없습니다.');
            case 500:
                throw new Error('서버 오류가 발생했습니다.');
            default:
                throw new Error(`오류가 발생했습니다. (${error.response.status})`);
        }
    }
);

/**
 * 단일 블록 문제 데이터 조회
 * @param {number} questionId - 문제 ID
 * @returns {Promise<Object>} 문제 데이터
 */
export async function getSingleQuestion(questionId) {
    try {
        if (!questionId || questionId <= 0) {
            throw new Error('유효하지 않은 문제 ID입니다.');
        }

        const response = await api.get(`/block/data/${questionId}`);

        // 응답 데이터 유효성 검사
        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching question ${questionId}:`, error);
        throw error; // 상위 컴포넌트에서 처리하도록 에러 전파
    }
}

/**
 * 사용자별 미해결 문제 목록 조회 (세션 기반)
 * @param {number} userId - 사용자 ID
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Array>} 미해결 문제 목록
 */
export async function getUnsolvedQuestions(userId, sessionId) {
    try {
        if (!userId || userId <= 0) {
            throw new Error('유효하지 않은 사용자 ID입니다.');
        }
        if (!sessionId) {
            throw new Error('세션 ID가 필요합니다.');
        }

        const response = await api.get(`/block/questions/unsolved?userId=${userId}&sessionId=${sessionId}`);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching unsolved questions for user ${userId}:`, error);
        throw error;
    }
}

/**
 * 사용자가 푼 문제를 제외한 랜덤 문제 조회 (세션 기반)
 * @param {number} userId - 사용자 ID
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Object>} 랜덤 문제 데이터
 */
export async function getRandomUnsolvedQuestion(userId, sessionId) {
    try {
        if (!userId || userId <= 0) {
            throw new Error('유효하지 않은 사용자 ID입니다.');
        }
        if (!sessionId) {
            throw new Error('세션 ID가 필요합니다.');
        }

        const response = await api.get(`/block/questions/random?userId=${userId}&sessionId=${sessionId}`);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching random unsolved question for user ${userId}:`, error);
        throw error;
    }
}

/**
 * 새로운 세션 ID 생성
 * @returns {Promise<string>} 새로 생성된 세션 ID
 */
export async function generateNewSession() {
    try {
        const response = await api.get('/block/session/new');

        if (!response.data) {
            throw new Error('서버에서 세션 ID를 생성하지 못했습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error generating new session:', error);
        throw error;
    }
}

/**
 * 문제 제출 및 정답 체크
 * @param {number} questionId - 문제 ID
 * @param {Object} submissionData - 제출 데이터
 * @returns {Promise<Object>} 제출 결과
 */
export async function submitAnswerToBackend(questionId, submissionData) {
    try {
        if (!questionId || questionId <= 0) {
            throw new Error('유효하지 않은 문제 ID입니다.');
        }

        if (!submissionData.user_id || !submissionData.session_id) {
            throw new Error('사용자 ID와 세션 ID가 필요합니다.');
        }

        const response = await api.post(`/block/questions/${questionId}/submit`, submissionData);

        if (!response.data) {
            throw new Error('서버에서 응답을 받지 못했습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error submitting answer for question ${questionId}:`, error);
        throw error;
    }
}

/**
 * 세션별 문제 해결 여부 확인
 * @param {number} questionId - 문제 ID
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<boolean>} 문제 해결 여부
 */
export async function isQuestionSolvedBySession(questionId, sessionId) {
    try {
        if (!questionId || questionId <= 0) {
            throw new Error('유효하지 않은 문제 ID입니다.');
        }

        if (!sessionId) {
            throw new Error('세션 ID가 필요합니다.');
        }

        const response = await api.get(`/block/questions/${questionId}/solved?sessionId=${sessionId}`);

        return response.data;
    } catch (error) {
        console.error(`Error checking question solved status for question ${questionId}:`, error);
        throw error;
    }
}

/**
 * 랜덤 블록 문제 데이터 조회
 * @returns {Promise<Object>} 랜덤 문제 데이터
 */
export async function getRandomQuestion() {
    try {
        const response = await api.get('/block/random');

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching random question:', error);
        throw error;
    }
}

/**
 * 모든 블록 문제 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호 (기본값: 1)
 * @param {number} params.size - 페이지 크기 (기본값: 10)
 * @param {string} params.difficulty - 난이도 필터
 * @returns {Promise<Object>} 문제 목록과 페이징 정보
 */
export async function getQuestionList(params = {}) {
    try {
        const { page = 1, size = 10, difficulty } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(difficulty && { difficulty })
        });

        const response = await api.get(`/block/questions?${queryParams}`);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching question list:', error);
        throw error;
    }
}

/**
 * 사용자 답안 제출
 * @param {number} questionId - 문제 ID
 * @param {string} userAnswer - 사용자 답안 (XML 형태)
 * @param {number} userId - 사용자 ID (선택적)
 * @returns {Promise<Object>} 채점 결과
 */
export async function submitAnswer(questionId, userAnswer, userId = null) {
    try {
        if (!questionId || !userAnswer) {
            throw new Error('문제 ID와 답안이 필요합니다.');
        }

        const requestData = {
            questionId,
            userAnswer,
            ...(userId && { userId })
        };

        const response = await api.post('/block/submit', requestData);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error submitting answer:', error);
        throw error;
    }
}

/**
 * 사용자 게임 기록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} 게임 기록
 */
export async function getUserGameRecord(userId) {
    try {
        if (!userId) {
            throw new Error('사용자 ID가 필요합니다.');
        }

        const response = await api.get(`/block/records/${userId}`);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching user record ${userId}:`, error);
        throw error;
    }
}

/**
 * Java 코드 실행 (서버에서 Java 코드를 실행하여 결과 반환)
 * @param {string} javaCode - 실행할 Java 코드
 * @returns {Promise<Object>} 실행 결과
 */
export async function executeJavaCode(javaCode) {
    try {
        if (!javaCode || javaCode.trim() === '') {
            throw new Error('실행할 Java 코드가 필요합니다.');
        }

        const response = await api.post('/block/execute-java', {
            code: javaCode
        });

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error executing Java code:', error);
        throw error;
    }
}

/**
 * Java 코드 검증 (문법 검사 및 예외 처리 검증)
 * @param {string} javaCode - 검증할 Java 코드
 * @returns {Promise<Object>} 검증 결과
 */
export async function validateJavaCode(javaCode) {
    try {
        if (!javaCode || javaCode.trim() === '') {
            throw new Error('검증할 Java 코드가 필요합니다.');
        }

        const response = await api.post('/block/validate-java', {
            code: javaCode
        });

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error validating Java code:', error);
        throw error;
    }
}

/**
 * 여러 정답을 지원하는 문제 데이터 조회
 * @param {number} questionId - 문제 ID
 * @returns {Promise<Object>} 문제 데이터 (answer 필드가 배열 형태)
 */
export async function getSingleQuestionWithMultipleAnswers(questionId) {
    try {
        if (!questionId || questionId <= 0) {
            throw new Error('유효하지 않은 문제 ID입니다.');
        }

        const response = await api.get(`/block/data/${questionId}/multiple-answers`);

        // 응답 데이터 유효성 검사
        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching question ${questionId} with multiple answers:`, error);
        throw error;
    }
}

/**
 * 여러 정답을 포함한 문제 생성/수정
 * @param {Object} questionData - 문제 데이터
 * @param {string} questionData.question - 문제 내용
 * @param {string} questionData.question_blocks - 초기 블록 XML
 * @param {Array<string>} questionData.answers - 정답 XML 배열
 * @param {Array<string>} questionData.toolbox - 사용 가능한 블록 타입 배열
 * @param {string} questionData.difficulty - 난이도
 * @returns {Promise<Object>} 생성된 문제 데이터
 */
export async function createQuestionWithMultipleAnswers(questionData) {
    try {
        if (!questionData.question || !questionData.answers || !Array.isArray(questionData.answers)) {
            throw new Error('문제 내용과 정답 배열이 필요합니다.');
        }

        const response = await api.post('/block/questions/multiple-answers', questionData);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error('Error creating question with multiple answers:', error);
        throw error;
    }
}

/**
 * 문제의 정답 목록 조회
 * @param {number} questionId - 문제 ID
 * @returns {Promise<Array>} 정답 XML 배열
 */
export async function getQuestionAnswers(questionId) {
    try {
        if (!questionId || questionId <= 0) {
            throw new Error('유효하지 않은 문제 ID입니다.');
        }

        const response = await api.get(`/block/questions/${questionId}/answers`);

        if (!response.data) {
            throw new Error('서버에서 빈 응답을 받았습니다.');
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching answers for question ${questionId}:`, error);
        throw error;
    }
}

export default api;

/**
 * (인증 필요) 사용자 오답 노트 전체 조회
 * WrongAnswerController: POST /wrong-answers
 * 공용 엔드포인트이므로 인증 토큰을 자동 포함하는 securedApi를 사용한다.
 */
export async function getWrongAnswers() {
    try {
        const response = await securedApi.post('/wrong-answers');
        return response.data;
    } catch (error) {
        console.error('Error fetching wrong answers:', error);
        throw error;
    }
}

/**
 * (인증 필요) 블록 게임 오답만 필터링하여 조회
 */
export async function getBlockWrongAnswers() {
    const all = await getWrongAnswers();
    return Array.isArray(all) ? all.filter(item => item.gameType === 'block') : [];
}