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
}
