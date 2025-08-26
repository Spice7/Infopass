package boot.infopass.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.CardDto;
import boot.infopass.dto.CardSubDto;
import boot.infopass.dto.GameResultDto;
import boot.infopass.service.CardGameService;
import boot.infopass.service.GameResultService;
import boot.infopass.service.UserService;
import boot.infopass.service.WrongAnswerService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/card")
@Slf4j
public class CardController {

	@Autowired
	CardGameService cardGameService;

	@Autowired
	WrongAnswerService wrongAnswerService;

	@Autowired
	UserService userService;
	
	@Autowired
	GameResultService gameResultService; 

	@PostMapping("/questions")
	public ResponseEntity<List<CardDto>> getQuestions(@RequestBody Map<String, Object> data) {

		return ResponseEntity.ok(cardGameService.getRandomQuestionsBySubjectExceptSolved(data));
	}

	// 문제 제출 및 오답 로그 제출
	@PostMapping("/questions/submit")
	public ResponseEntity<?> saveQuestionAttempts(@RequestBody List<CardSubDto> submissions) {
		try {
			// 전체 문제 제출
			cardGameService.saveQuestionAttempts(submissions);

			//오답문제 log 제출
			for (int i = 0; i < submissions.size(); i++) {
				CardSubDto dto = submissions.get(i);
				if (!dto.getIs_correct()) {
					wrongAnswerService.insertCardWrongAnswer(dto.getUser_id(), dto.getQuestion_id()
							);
				}
			}
			return ResponseEntity.ok(Map.of("success", true));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "서버 오류"));
		}
	}
	
	// 싱글 유저 경험치,점수 제출
	@PostMapping("/game/result")
	public ResponseEntity<?> CreateSingleplayResult(@RequestBody Map<String, Object> data) {
		log.info("경험치,점수 제출 데이터 : "+data);
		try {			
			Object userIdObj = data.get("user_id");
			Object scoreObj = data.get("score");
			Object userExpObj = data.get("user_exp");
			Object gameTypeObj = data.get("user_type");
			
			log.info("userIdObj: {}, scoreObj: {}, userExpObj: {}, gameTypeObj: {}", 
				userIdObj, scoreObj, userExpObj, gameTypeObj);
			
			if (userIdObj == null || scoreObj == null || userExpObj == null || gameTypeObj == null) {
				log.error("필수 데이터가 누락되었습니다.");
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "필수 데이터 누락"));
			}
			
			int userId = Integer.parseInt(userIdObj.toString());
			int score = Integer.parseInt(scoreObj.toString());
			int userExp = Integer.parseInt(userExpObj.toString());
			String gameType = gameTypeObj.toString();
			
			log.info("파싱된 데이터 - userId: {}, score: {}, userExp: {}, gameType: {}", 
				userId, score, userExp, gameType);
			
			gameResultService.createSingleplayResult(userId, score, userExp, gameType);
			
			return ResponseEntity.ok(Map.of("success", true));
		} catch (NumberFormatException e) {
			log.error("숫자 변환 오류: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "숫자 변환 오류"));
		} catch (Exception e) {
			log.error("서버 오류: {}", e.getMessage(), e);
			return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "서버 오류: " + e.getMessage()));
		}		
	}
	
	//새로운 세션 ID 생성	 
	@GetMapping("/session/new")
	public ResponseEntity<String> generateNewSession() {
		try {
			String sessionId = cardGameService.generateSessionId();
			log.info("sessionId: " + sessionId);
			return ResponseEntity.ok(sessionId);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}

	// 답안 제출 요청을 위한 내부 클래스
	public static class AnswerSubmissionRequest {
		private Integer user_id;
		private Integer question_id;
		private String session_id;
		private boolean is_correct;
		private String submitted_answer;

		// Getters and Setters
		public Integer getUser_id() {
			return user_id;
		}

		public void setUser_id(Integer user_id) {
			this.user_id = user_id;
		}

		public Integer getQuestion_id() {
			return question_id;
		}

		public void setQuestion_id(Integer question_id) {
			this.question_id = question_id;
		}

		public String getSession_id() {
			return session_id;
		}

		public void setSession_id(String session_id) {
			this.session_id = session_id;
		}

		public boolean isIs_correct() {
			return is_correct;
		}

		public void setIs_correct(boolean is_correct) {
			this.is_correct = is_correct;
		}

		public String getSubmitted_answer() {
			return submitted_answer;
		}

		public void setSubmitted_answer(String submitted_answer) {
			this.submitted_answer = submitted_answer;
		}
	}

}
