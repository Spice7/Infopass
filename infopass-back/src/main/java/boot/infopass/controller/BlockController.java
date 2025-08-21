package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.BlockDTO;
import boot.infopass.mapper.BlockMapper;
import boot.infopass.service.BlockGameService;
import boot.infopass.service.GameResultService;
import boot.infopass.service.WrongAnswerService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/block")
public class BlockController {
	@Autowired
	BlockMapper mapper;
	
	@Autowired
	BlockGameService blockGameService;

	@Autowired
	WrongAnswerService wrongAnswerService;

	@Autowired
	GameResultService gameResultService;
	
	@GetMapping("/data/{id}")
	public BlockDTO getSingleData(@PathVariable("id") int id) {
		return mapper.getSingleData(id);
	}
	
	/**
	 * 사용자별 미해결 문제 목록 조회 (세션 기반)
	 */
	@GetMapping("/questions/unsolved")
	public ResponseEntity<List<BlockDTO>> getUnsolvedQuestions(
			@RequestParam("userId") int userId,
			@RequestParam("sessionId") String sessionId) {
		try {
			List<BlockDTO> questions = blockGameService.getUnsolvedQuestions(userId, sessionId);
			return ResponseEntity.ok(questions);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 사용자가 푼 문제를 제외한 랜덤 문제 조회 (세션 기반)
	 */
	@GetMapping("/questions/random")
	public ResponseEntity<BlockDTO> getRandomUnsolvedQuestion(
			@RequestParam("userId") int userId,
			@RequestParam("sessionId") String sessionId) {
		try {
			BlockDTO question = blockGameService.getRandomUnsolvedQuestion(userId, sessionId);
			if (question != null) {
				return ResponseEntity.ok(question);
			} else {
				return ResponseEntity.notFound().build();
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 새로운 세션 ID 생성
	 */
	@GetMapping("/session/new")
	public ResponseEntity<String> generateNewSession() {
		try {
			String sessionId = blockGameService.generateSessionId();
			return ResponseEntity.ok(sessionId);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 문제 제출 및 정답 체크
	 */
	@PostMapping("/questions/{questionId}/submit")
	public ResponseEntity<Object> submitAnswer(
			@PathVariable("questionId") int questionId,
			@RequestBody AnswerSubmissionRequest request) {
		try {
			// 문제 해결 시도 기록
			boolean saved = blockGameService.saveQuestionAttempt(
				questionId, request.user_id, request.session_id, request.is_correct, request.submitted_answer);

			// 오답인 경우 wronganswer_log 에 별도 기록 (블록 게임 전용)
			if (!request.is_correct) {
				wrongAnswerService.insertBlockWrongAnswer(
					request.user_id,
					questionId,
					request.submitted_answer
				);
			}
			
			if (saved) {
				return ResponseEntity.ok(Map.of(
					"success", true,
					"isCorrect", request.is_correct,
					"message", request.is_correct ? "정답입니다!" : "오답입니다."
				));
			} else {
				return ResponseEntity.internalServerError().body(Map.of(
					"success", false,
					"message", "답안 저장에 실패했습니다."
				));
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"message", "서버 오류가 발생했습니다."
			));
		}
	}

	/**
	 * 세션 종료 기록: singleplay_result에 1회 저장 (score=0, user_exp=누적경험치, game_type=block)
	 */
	@PostMapping("/session/complete")
	public ResponseEntity<Object> completeSession(@RequestBody Map<String, Object> body) {
		try {
			Object userIdObj = body.get("user_id");
			Object sessionIdObj = body.get("session_id");
			Object userExpObj = body.get("user_exp");
			if (!(userIdObj instanceof Number) || sessionIdObj == null || !(userExpObj instanceof Number)) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"message", "user_id, session_id, user_exp가 필요합니다."
				));
			}
			int userId = ((Number) userIdObj).intValue();
			int userExp = ((Number) userExpObj).intValue();
			if (userId <= 0) {
				return ResponseEntity.badRequest().body(Map.of(
					"success", false,
					"message", "유효하지 않은 사용자입니다."
				));
			}
			// score는 0으로 고정, game_type은 block
			gameResultService.createSingleplayResult(userId, 0, userExp, "block");
			return ResponseEntity.ok(Map.of(
				"success", true
			));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of(
				"success", false,
				"message", "세션 완료 처리 중 오류가 발생했습니다."
			));
		}
	}
	
	/**
	 * 세션별 문제 해결 여부 확인
	 */
	@GetMapping("/questions/{questionId}/solved")
	public ResponseEntity<Boolean> isQuestionSolved(
			@PathVariable("questionId") int questionId,
			@RequestParam("sessionId") String sessionId) {
		try {
			boolean isSolved = blockGameService.isQuestionSolvedBySession(questionId, sessionId);
			return ResponseEntity.ok(isSolved);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	// 답안 제출 요청을 위한 내부 클래스
	public static class AnswerSubmissionRequest {
		private int user_id;
		private String session_id;
		private boolean is_correct;
		private String submitted_answer;
		
		// Getters and Setters
		public int getUser_id() { return user_id; }
		public void setUser_id(int user_id) { this.user_id = user_id; }
		public String getSession_id() { return session_id; }
		public void setSession_id(String session_id) { this.session_id = session_id; }
		public boolean isIs_correct() { return is_correct; }
		public void setIs_correct(boolean is_correct) { this.is_correct = is_correct; }
		public String getSubmitted_answer() { return submitted_answer; }
		public void setSubmitted_answer(String submitted_answer) { this.submitted_answer = submitted_answer; }
	}
}
