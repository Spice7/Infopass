package boot.infopass.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.OXQuizAdminDto;
import boot.infopass.mapper.OxQuizMapper;
import boot.infopass.mapper.OXSubMapper;
import boot.infopass.mapper.WrongAnswerMapper;

@Service
public class AdminOXQuestionService {

	@Autowired
	private OxQuizMapper oxQuizMapper;
	
	@Autowired
	private OXSubMapper oxSubMapper;
	
	@Autowired
	private WrongAnswerMapper wrongAnswerMapper;

	public Map<String, Object> list(String q, String category, Integer page, Integer size) {
		Map<String, Object> params = new HashMap<>();
		params.put("q", q);
		params.put("category", category);
		params.put("page", page);
		params.put("size", size);
		int safePage = (page == null || page < 0) ? 0 : page;
		int safeSize = (size == null || size <= 0) ? 20 : size;
		int offset = safePage * safeSize;
		params.put("offset", offset);
		List<OXQuizAdminDto> items = oxQuizMapper.listOXQuizQuestions(params);
		int total = oxQuizMapper.countOXQuizQuestions(params);
		Map<String, Object> result = new HashMap<>();
		result.put("items", items);
		result.put("total", total);
		result.put("page", page);
		result.put("size", size);
		return result;
	}

	public OXQuizAdminDto findById(Integer id) {
		return oxQuizMapper.findOXQuizQuestionById(id);
	}

	public int insert(OXQuizAdminDto dto) {
		return oxQuizMapper.insertOXQuizQuestion(dto);
	}

	public int[] bulkInsert(List<OXQuizAdminDto> dtos) {
		int[] results = new int[dtos.size()];
		for (int i = 0; i < dtos.size(); i++) {
			results[i] = oxQuizMapper.insertOXQuizQuestion(dtos.get(i));
		}
		return results;
	}

	public int update(OXQuizAdminDto dto) {
		return oxQuizMapper.updateOXQuizQuestion(dto);
	}

	public int delete(Integer id) {
		// 1. 먼저 관련된 오답 기록을 삭제
		int deletedWrongAnswers = wrongAnswerMapper.deleteWrongAnswersByQuestionId(id);
		System.out.println("삭제된 오답 기록 수: " + deletedWrongAnswers);
		
		// 2. 관련된 submission 데이터를 삭제
		int deletedSubmissions = oxSubMapper.deleteSubmissionsByQuestionId(id);
		System.out.println("삭제된 submission 수: " + deletedSubmissions);
		
		// 3. 마지막에 문제를 삭제
		return oxQuizMapper.deleteOXQuizQuestion(id);
	}

	public int countByCategory(String category) {
		return oxQuizMapper.countByCategory(category);
	}
}
