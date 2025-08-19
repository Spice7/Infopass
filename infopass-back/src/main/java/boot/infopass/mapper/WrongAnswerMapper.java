package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.WrongAnswerDto;

@Mapper
public interface WrongAnswerMapper {

	public void insertWrongAnswer(WrongAnswerDto dto);

	// 블록 게임 전용 오답 기록
	public void insertBlockWrongAnswer(WrongAnswerDto dto);

	public List<WrongAnswerDto> selectWrongAnswersByUserId(int userId);

	// 블록 게임 전용 오답 조회
	public List<WrongAnswerDto> selectWrongBlockAnswersByUserId(int userId);
}
