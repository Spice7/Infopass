package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.OXQuizDto;

@Mapper
public interface OxQuizMapper {

	public List<OXQuizDto> GetAllQuiz();
}
