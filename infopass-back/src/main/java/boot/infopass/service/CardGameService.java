package boot.infopass.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.CardDto;
import boot.infopass.dto.CardSubDto;
import boot.infopass.dto.CardStatusDto;
import boot.infopass.mapper.CardMapper;

@Service
public class CardGameService {

	@Autowired
	CardMapper cardMapper;
	
	public List<CardDto> getRandomQuestionsBySubjectExceptSolved(Map<String, Object> data) {
		return cardMapper.getRandomQuestionsBySubjectExceptSolved(data);
	}
	
    public CardDto getSingleData(Integer id) {
    	return cardMapper.getSingleData(id);
    }
	public void insertCardSub(CardSubDto cardSub){
		cardMapper.insertCardSub(cardSub);
	}
	
	public void saveGameResult(CardStatusDto gameResult) {
		cardMapper.saveGameResult(gameResult);
	}

}
