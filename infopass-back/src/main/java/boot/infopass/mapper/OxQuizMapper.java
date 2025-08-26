package boot.infopass.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.OXQuizDto;
import boot.infopass.dto.OXQuizAdminDto;

@Mapper
public interface OxQuizMapper {

	public List<OXQuizDto> GetAllQuiz();
	
	// Admin CRUD
	public List<OXQuizAdminDto> listOXQuizQuestions(Map<String, Object> params);
	public int countOXQuizQuestions(Map<String, Object> params);
	public OXQuizAdminDto findOXQuizQuestionById(Integer id);
	public int insertOXQuizQuestion(OXQuizAdminDto dto);
	public int updateOXQuizQuestion(OXQuizAdminDto dto);
	public int deleteOXQuizQuestion(Integer id);
	public int countByCategory(String category);
}
