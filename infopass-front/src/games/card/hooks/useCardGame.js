import { useState, useEffect, useContext } from 'react';
import * as auth from '../CardAuth';
import { LoginContext } from '../../../user/LoginContextProvider';
import { useNavigate } from 'react-router-dom';
import { applyExp } from '../../../user/gameResult';

export const useCardGame = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameMode, setGameMode] = useState('normal');
    const [isLoading, setIsLoading] = useState(false);
    const [questionData, setQuestionData] = useState([]);
    const [randomSubject, setRandomSubject] = useState('소프트웨어 설계');
    const [showNextButton, setShowNextButton] = useState(false);
    const [question_id, setQuestion_id] = useState([]);
    const [session_id, setSession_id] = useState('');
    const navigate = useNavigate();
    const { userInfo } = useContext(LoginContext);

    // 과목 리스트
    const subjectList = [
        '소프트웨어 설계',
        '소프트웨어 개발',
        '데이터베이스 구축',
        '프로그래밍 언어 활용',
        '정보시스템 구축 관리'
    ];

    // 게임 초기화 시 세션 ID 생성
    useEffect(() => {
        const initializeGame = async () => {
            try {
                const newSessionId = await auth.generateNewSession();
                setSession_id(newSessionId.data);
            } catch (error) {
                console.error('세션 ID 생성 실패:', error);
            }
        };
        initializeGame();
        if(!userInfo){
            alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        }
    }, [userInfo]);



    // 문제 불러오기 + 카드 배열 생성 통합
    const startNewGame = async (question_idParam = [], retryCount = 0) => {

        //if(!isLoading) return; // 로딩 중일 때는 새 게임 시작하지 않음 
        setShowNextButton(false);
        try {
            // 세션이 없다면 생성 후 사용
            let currentSessionId = session_id;
            if (!currentSessionId) {
                try {
                    currentSessionId = await auth.generateNewSession();
                    setSession_id(currentSessionId);
                } catch (e) {
                    console.error('세션 ID 생성 실패:', e);
                }
            }

            // 랜덤 과목 선택
            const subject = subjectList[Math.floor(Math.random() * subjectList.length)];
            setRandomSubject(subject);
            console.log(subject);

            console.log("세션ID: ", currentSessionId);
            const response = await auth.getCardQuestions(subject, userInfo?.id, question_idParam, currentSessionId);
            console.log("문제리스트: ", response.data);
            let questions = (response && response.data) ? response.data : [];

            // 8문제 미만이면 최대 5번까지 랜덤 subject로 재시도
            if (questions.length < 8 && retryCount < 5) {
                // 재귀적으로 다른 랜덤 subject로 재시도
                await startNewGame(question_idParam, retryCount + 1);
                return;
            }

            // 여전히 문제를 하나도 못 가져오면(모든 문제를 다 풀었을 때) 자동 게임종료
            if (!questions || questions.length === 0) {                
                alert('모든 문제를 다 풀었습니다! 게임이 종료됩니다.');
                handleGameEnd({ finalScore: score });
                return;
            }

            const selectedQuestions = questions;

            // 질문과 답변을 각각 카드로 생성
            const gameCards = [];
            selectedQuestions.forEach((item) => {
                // 질문 카드
                gameCards.push({
                    id: `q${item.id}`,
                    type: 'question',
                    content: item.question,
                    pairId: item.id,
                    isFlipped: false,
                    isMatched: false
                });

                // 답변 카드
                gameCards.push({
                    id: `a${item.id}`,
                    type: 'answer',
                    content: item.answer,
                    pairId: item.id,
                    isFlipped: false,
                    isMatched: false
                });
            });

            // 카드 배열을 랜덤으로 섞는 함수 (Fisher-Yates 셔플 알고리즘)
            const shuffleCards = (cards) => {
                const shuffled = [...cards];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            };

            // 카드 배열을 랜덤으로 섞기 (Fisher-Yates 셔플 알고리즘)
            const shuffledCards = shuffleCards(gameCards);

            // 상태 초기화
            setQuestionData(questions);
            setCards(gameCards);
            setFlippedCards([]);
            setMatchedPairs([]);
            setShowNextButton(false);
            setGameStarted(true);
            setIsPlaying(true);

        } catch (error) {
            console.error('문제 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 카드 클릭 처리
    const handleCardClick = (cardId) => {
        if (!isPlaying || flippedCards.length === 2) return;

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isMatched || card.isFlipped) return;

        // 카드 뒤집기
        const updatedCards = cards.map(c =>
            c.id === cardId ? { ...c, isFlipped: true } : c
        );
        setCards(updatedCards);

        // 뒤집힌 카드에 추가
        const newFlippedCards = [...flippedCards, card];
        setFlippedCards(newFlippedCards);

        // 2장이 뒤집혔을 때 매칭 확인
        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);

            if (newFlippedCards[0].pairId === newFlippedCards[1].pairId) {
                // 매칭 성공
                setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map(c =>
                            c.pairId === newFlippedCards[0].pairId
                                ? { ...c, isMatched: true }
                                : c
                        )
                    );
                    setMatchedPairs(prev => [...prev, newFlippedCards[0].pairId]);
                    setScore(prev => prev + 10);
                    setFlippedCards([]);

                    // 모든 카드가 매칭되었는지 확인
                    const newMatchedPairs = [...matchedPairs, newFlippedCards[0].pairId];
                    if (newMatchedPairs.length === questionData.length) {
                        // 모든 카드 매칭 완료 시 다음문제 버튼 표시
                        setShowNextButton(true);

                        // 모든 모드에서 모든 카드 매칭 완료 시 자동으로 DB에 저장
                        saveSubmissionData({isTimeout: false, autoSave: true});
                    }
                }, 500);
            } else {
                // 매칭 실패
                setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map(c =>
                            newFlippedCards.some(fc => fc.id === c.id)
                                ? { ...c, isFlipped: false }
                                : c
                        )
                    );
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    // 카드 매칭 완료 문제 데이터 저장
    const saveSubmissionData = async ({ isTimeout = false, autoSave = true } = {}) => {
        
        
        // 맞힌 문제/틀린 문제 추출
        const correctPairIds = cards.filter(card => card.isMatched).map(card => card.pairId);
        const correctQuestions = questionData.filter(q => correctPairIds.includes(q.id));
        const wrongPairIds = cards.filter(card => !card.isMatched).map(card => card.pairId);
        const wrongQuestions = questionData.filter(q => wrongPairIds.includes(q.id));

        let submissions = [];
        // 노멀모드: 모든 카드 매칭 완료 시에만 저장
        
        if (
            gameMode === 'normal' &&
            cards.length > 0 &&
            cards.every(card => card.isMatched) || autoSave === true
        ) {
            setQuestion_id(prev => [...prev, ...correctPairIds.filter(id => !prev.includes(id))]);
            
            submissions = correctQuestions.map(q => ({
                user_id: userInfo?.id,
                question_id: q.id,
                session_id,
                submitted_answer: q.answer,
                is_correct: true
            }));
            console.log('정답 제출:', submissions);
            
        }
        // 타임어택: 모든 카드 매칭 완료 시 또는 시간초과 시 맞힌 문제/오답 모두 저장
        if (gameMode === 'timeAttack' || autoSave === false) {
            if (cards.length > 0 && cards.every(card => card.isMatched)) {
                setQuestion_id(prev => [...prev, ...correctPairIds.filter(id => !prev.includes(id))]);
                submissions = correctQuestions.map(q => ({
                    user_id: userInfo?.id,
                    question_id: q.id,
                    session_id,
                    submitted_answer: q.answer,
                    is_correct: true
                }));
                console.log('정답 제출:', submissions);
            } else if (isTimeout) {
                submissions = [
                    ...correctQuestions.map(q => ({
                        user_id: userInfo?.id,
                        question_id: q.id,
                        session_id,
                        submitted_answer: q.answer,
                        is_correct: true
                    })),
                    ...wrongQuestions.map(q => ({
                        user_id: userInfo?.id,
                        question_id: q.id,
                        session_id,
                        submitted_answer: q.answer,
                        is_correct: false
                    }))
                ];                
            }
        }
    
        if (submissions.length > 0) {
            try {
                console.log('제출 데이터:', submissions);
                await auth.saveSubmission(submissions);
            } catch (e) {
                console.error('문제 제출 실패:', e);
            }
        }
    
    };

    // 게임 종료 처리
    const handleGameEnd = async ({finalScore}) => {
        setIsPlaying(false);
        setGameStarted(true);
        setShowNextButton(false);
        saveSubmissionData({ isTimeout: true, autoSave: false });
        saveScoreAndExp(finalScore);
    };
    // 게임 종료 시 경험치/점수 저장
    const saveScoreAndExp = async (finalScore) => {
        try {
            const expDelta = ({
                userId: userInfo?.id,
                score: finalScore,
                user_exp: finalScore / 10,
                game_type: "card"
            });
            await applyExp(expDelta.user_exp);
            await auth.saveGameResult(expDelta);
            console.log('점수/경험치 저장 성공:', expDelta);
        } catch (e) {
            console.error('점수/경험치 저장 실패:', e);
        }
    };

    // 게임 설정화면으로 이동 (저장하지 않음)
    const handleExitToMenu = () => {
        setGameStarted(false);
        setIsPlaying(false);
        setShowNextButton(false);
        setScore(0);
        setMoves(0);
        setMatchedPairs([]);
        setFlippedCards([]);
        setCards([]);
        setGameMode('normal');
        setQuestion_id([]);
        navigate('/');
    };

    // "다음 문제" 버튼 클릭 시 새로운 랜덤 과목의 문제로 새 게임 시작
    const handleNextQuestions = () => {        
        setShowNextButton(false);        
        setScore(score);
        setMoves(moves);

        // 이전에 푼 문제들을 question_id에 추가하고 DB에 저장
        const currentMatchedPairs = cards.filter(card => card.isMatched).map(card => card.pairId);
        setQuestion_id(prev => [...prev, ...currentMatchedPairs.filter(id => !prev.includes(id))]);

        // 맞힌 문제들을 DB에 저장
        if (currentMatchedPairs.length > 0) {
            const correctQuestions = questionData.filter(q => currentMatchedPairs.includes(q.id));
            const submissions = correctQuestions.map(q => ({
                user_id: userInfo?.id,
                question_id: q.id,
                session_id,
                submitted_answer: q.answer,
                is_correct: true
            }));

            // 백그라운드에서 저장
            auth.saveSubmission(submissions).catch(e => {
                console.error('문제 제출 실패:', e);
            });
        }

        setTimeout(() => {
            startNewGame(question_id);
        }, 300);
    };

    // 게임 모드 변경
    const changeGameMode = (mode) => {
        setGameMode(mode);
    };

    // "게임 재시작" 버튼 클릭 시
    const handleRestart = async () => {
        try {
            const newSessionId = await auth.generateNewSession();
            setSession_id(newSessionId.data);
        } catch (error) {
            console.error('새 세션 ID 생성 실패:', error);
        }

        // 게임 상태 초기화 후 새 게임 시작
        setGameStarted(false);
        setIsPlaying(false);
        setScore(0);
        setMoves(0);
        setMatchedPairs([]);
        setFlippedCards([]);
        setCards([]);
        setGameMode('normal');
        setQuestion_id([]);

        // 잠시 후 새 게임 시작 (상태 초기화 완료 후)
        setTimeout(() => {
            startNewGame();
        }, 100);
    };

    return {
        // 상태
        cards,
        matchedPairs,
        gameStarted,
        score,
        moves,
        isPlaying,
        gameMode,
        isLoading,
        questionData,
        randomSubject,
        showNextButton,
        session_id,

        // 함수
        startNewGame,
        handleCardClick,
        handleGameEnd,
        handleNextQuestions,
        changeGameMode,
        handleRestart,
        handleExitToMenu
    };
};
