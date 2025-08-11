package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.WrongAnswerDto;

@Mapper
public interface WrongAnswerMapper {

	public void insertWrongAnswer(WrongAnswerDto dto);
}
