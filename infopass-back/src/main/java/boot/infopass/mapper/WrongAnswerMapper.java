package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.WrongAnswerDto;

@Mapper
public interface WrongAnswerMapper {

	public void insertWrongAnswer(WrongAnswerDto dto);

	public List<WrongAnswerDto> selectWrongAnswersByUserId(int userId);
}
