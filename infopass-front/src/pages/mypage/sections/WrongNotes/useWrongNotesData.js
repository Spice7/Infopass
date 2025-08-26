import { useEffect, useState, useMemo } from 'react';
import { getWrongAnswers } from '@/user/gameResult.js';

const useWrongNotesData = () => {
  const [wrongAnswers, setWrongAnswers] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState('all');

  useEffect(() => {
    const fetchWrongNotes = async () => {
      try {
        const response = await getWrongAnswers();
        setWrongAnswers(response.data);
      } catch (error) {
        console.error('오답노트 요청 에러:', error);
        setWrongAnswers([]);
      }
    };
    fetchWrongNotes();
  }, []);

  const convertOX = (val) => {
    if (val === 1 || val === '1') return 'O';
    if (val === 0 || val === '0') return 'X';
    return val;
  };

  const processedAnswers = useMemo(() => {
    if (!wrongAnswers || wrongAnswers.length === 0) return [];
    const map = new Map();
    wrongAnswers.forEach((item) => {
      if (item && item.gameType && item.questionId) {
        const key = `${item.gameType.toLowerCase()}-${item.questionId}`;
        const currentCreatedAt = item.createdAt ? new Date(item.createdAt) : new Date(0);
        if (map.has(key)) {
          const existing = map.get(key);
          existing.count += 1;
          existing.answers = existing.answers
            ? [...existing.answers, item.submittedAnswer]
            : [item.submittedAnswer];
          const existingCreatedAt = existing.createdAt ? new Date(existing.createdAt) : new Date(0);
          if (currentCreatedAt > existingCreatedAt) {
            map.set(key, { ...item, count: existing.count, answers: existing.answers });
          }
        } else {
          map.set(key, { ...item, count: 1, answers: [item.submittedAnswer] });
        }
      }
    });
    return Array.from(map.values());
  }, [wrongAnswers]);

  const filteredWrongAnswers = useMemo(() => {
    return selectedGameType === 'all'
      ? processedAnswers
      : processedAnswers.filter(
          (item) => item.gameType && item.gameType.toLowerCase() === selectedGameType.toLowerCase()
        );
  }, [selectedGameType, processedAnswers]);

  const formatAnswers = (answers) => {
    return answers
      .map((a) => (a == null || a === '' ? '미제출' : convertOX(a)))
      .join(', ');
  };

  return {
    isLoading: wrongAnswers === null,
    wrongAnswers,
    filteredWrongAnswers,
    selectedGameType,
    setSelectedGameType,
    formatAnswers,
    convertOX,
  };
};

export default useWrongNotesData;