package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.PathVariable;

import boot.infopass.dto.BlockDTO;
import boot.infopass.dto.BlockSubDTO;

@Mapper
public interface BlockMapper {
	public BlockDTO getSingleData(@PathVariable("id") int id);
	public BlockDTO getAllDatas();
	
	// 사용자별 미해결 문제 목록 조회 (세션 기반)
	public List<BlockDTO> getUnsolvedQuestions(@Param("userId") int userId, @Param("sessionId") String sessionId);
	
	// 랜덤 문제 조회 (사용자가 푼 문제 제외, 세션 기반)
	public BlockDTO getRandomUnsolvedQuestion(@Param("userId") int userId, @Param("sessionId") String sessionId);
	
	// 문제 해결 기록 저장
	public int saveQuestionAttempt(BlockSubDTO blockSubDTO);
	
	// 세션별 문제 해결 여부 확인
	public boolean isQuestionSolvedBySession(@Param("questionId") int questionId, @Param("sessionId") String sessionId);
}
