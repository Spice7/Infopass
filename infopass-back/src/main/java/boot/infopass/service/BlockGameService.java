package boot.infopass.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.BlockDTO;
import boot.infopass.dto.BlockSubDTO;
import boot.infopass.mapper.BlockMapper;

@Service
public class BlockGameService {
	
	@Autowired
	private BlockMapper blockMapper;
	
	/**
	 * 사용자별 미해결 문제 목록 조회 (세션 기반)
	 */
	public List<BlockDTO> getUnsolvedQuestions(int userId, String sessionId) {
		return blockMapper.getUnsolvedQuestions(userId, sessionId);
	}
	
	/**
	 * 사용자가 푼 문제를 제외한 랜덤 문제 조회 (세션 기반)
	 */
	public BlockDTO getRandomUnsolvedQuestion(int userId, String sessionId) {
		return blockMapper.getRandomUnsolvedQuestion(userId, sessionId);
	}
	
	/**
	 * 새로운 세션 ID 생성
	 */
	public String generateSessionId() {
		return UUID.randomUUID().toString();
	}
	
	/**
	 * 문제 해결 시도 기록
	 */
	public boolean saveQuestionAttempt(int questionId, int userId, String sessionId, boolean isCorrect, String submittedAnswer) {
		BlockSubDTO blockSubDTO = new BlockSubDTO();
		blockSubDTO.setQuestion_id(questionId);
		blockSubDTO.setUser_id(userId);
		blockSubDTO.setSession_id(sessionId);
		blockSubDTO.setIs_correct(isCorrect);
		blockSubDTO.setSubmitted_answer(submittedAnswer);
		
		int result = blockMapper.saveQuestionAttempt(blockSubDTO);
		return result > 0;
	}
	
	/**
	 * 세션별 문제 해결 여부 확인
	 */
	public boolean isQuestionSolvedBySession(int questionId, String sessionId) {
		return blockMapper.isQuestionSolvedBySession(questionId, sessionId);
	}
	
	/**
	 * 특정 문제 상세 조회
	 */
	public BlockDTO getQuestionById(int questionId) {
		return blockMapper.getSingleData(questionId);
	}
}
