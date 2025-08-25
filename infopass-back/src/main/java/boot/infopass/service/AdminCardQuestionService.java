package boot.infopass.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.CardDto;
import boot.infopass.mapper.CardMapper;

@Service
public class AdminCardQuestionService {

	@Autowired
	private CardMapper cardMapper;

	public Map<String, Object> list(String q, String subject, Integer page, Integer size) {
		Map<String, Object> params = new HashMap<>();
		params.put("q", q);
		params.put("subject", subject);
		params.put("page", page);
		params.put("size", size);
		int safePage = (page == null || page < 0) ? 0 : page;
		int safeSize = (size == null || size <= 0) ? 20 : size;
		int offset = safePage * safeSize;
		params.put("offset", offset);
		List<CardDto> items = cardMapper.listCardQuestions(params);
		int total = cardMapper.countCardQuestions(params);
		Map<String, Object> result = new HashMap<>();
		result.put("items", items);
		result.put("total", total);
		result.put("page", page);
		result.put("size", size);
		return result;
	}

	public CardDto findById(Integer id) {
		return cardMapper.findCardQuestionById(id);
	}

	public int insert(CardDto dto) {
		return cardMapper.insertCardQuestion(dto);
	}

	public int[] bulkInsert(List<CardDto> dtos) {
		int[] results = new int[dtos.size()];
		for (int i = 0; i < dtos.size(); i++) {
			results[i] = cardMapper.insertCardQuestion(dtos.get(i));
		}
		return results;
	}

	public int update(CardDto dto) {
		return cardMapper.updateCardQuestion(dto);
	}

	public int delete(Integer id) {
		return cardMapper.deleteCardQuestion(id);
	}

	public int countBySubject(String subject) {
		return cardMapper.countBySubject(subject);
	}
}


