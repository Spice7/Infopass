package boot.infopass.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.CardDto;

import boot.infopass.dto.CardSubDto;

@Mapper
public interface CardMapper {   

    public List<CardDto> getRandomQuestionsBySubjectExceptSolved(Map<String, Object> data);
    public boolean saveQuestionAttempt(CardSubDto cardSubDto);

    // Admin CRUD
    public List<CardDto> listCardQuestions(Map<String, Object> params);
    public int countCardQuestions(Map<String, Object> params);
    public CardDto findCardQuestionById(Integer id);
    public int insertCardQuestion(CardDto dto);
    public int updateCardQuestion(CardDto dto);
    public int deleteCardQuestion(Integer id);
    public int countBySubject(String subject);
}
