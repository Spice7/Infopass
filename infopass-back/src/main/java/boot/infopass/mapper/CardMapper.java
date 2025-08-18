package boot.infopass.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.CardDto;
import boot.infopass.dto.CardStatusDto;
import boot.infopass.dto.CardSubDto;

@Mapper
public interface CardMapper {   

    public List<CardDto> getAllCards();
	public CardDto getSingleData(Integer id);
    public void insertCard(CardDto card);
    public void updateCard(CardDto card);
    public void deleteCard(Integer id);
    public void insertCardSub(CardSubDto cardSub);
    public List<CardSubDto> getCardSubsByUserId(Integer userId);
    public void saveResult(CardStatusDto cardStatus);
    public void saveGameResult(CardStatusDto gameResult);
}
