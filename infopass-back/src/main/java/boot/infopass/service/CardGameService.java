package boot.infopass.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.CardDto;
import boot.infopass.dto.CardSubDto;
import boot.infopass.mapper.CardMapper;

@Service
public class CardGameService {

	@Autowired
	CardMapper cardMapper;
	
	public List<CardDto> getRandomQuestionsBySubjectExceptSolved(Map<String, Object> data) {
		return cardMapper.getRandomQuestionsBySubjectExceptSolved(data);
	}

	public void saveQuestionAttempts(List<CardSubDto> submissions) {
		for (CardSubDto dto : submissions) {
			cardMapper.saveQuestionAttempt(dto);
		}
	}

	// 새로운 세션 ID 생성
	public String generateSessionId() {
		return UUID.randomUUID().toString();
	}
}
