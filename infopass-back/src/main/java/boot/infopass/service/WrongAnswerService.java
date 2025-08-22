package boot.infopass.service;

import java.util.List;

import org.springframework.stereotype.Service;

import boot.infopass.dto.WrongAnswerDto;
import boot.infopass.mapper.WrongAnswerMapper;

@Service
public class WrongAnswerService {
    private final WrongAnswerMapper wrongAnswerMapper;

    public WrongAnswerService(WrongAnswerMapper wrongAnswerMapper) {
        this.wrongAnswerMapper = wrongAnswerMapper;
    }

    public List<WrongAnswerDto> findByUserId(int userId) {
        return wrongAnswerMapper.selectWrongAnswersByUserId(userId);
    }

    /**
     * 블록 게임 오답 기록
     */
    public void insertBlockWrongAnswer(int userId, int questionId, String submittedAnswer) {
        WrongAnswerDto dto = new WrongAnswerDto();
        dto.setUserId(userId);
        dto.setGameType("block");
        dto.setQuestionId(questionId);
        dto.setSubmittedAnswer(submittedAnswer);
        wrongAnswerMapper.insertBlockWrongAnswer(dto);
    }

    /**
     * 블록 게임 오답 조회 (사용자별)
     */
    public List<WrongAnswerDto> findBlockWrongsByUserId(int userId) {
        return wrongAnswerMapper.selectWrongBlockAnswersByUserId(userId);
    }
}
