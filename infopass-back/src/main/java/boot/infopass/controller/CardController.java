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
import boot.infopass.service.CardGameService;
import boot.infopass.service.UserService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/card")
@Slf4j
public class CardController {

	@Autowired
	CardGameService cardGameService;
	
	@Autowired
	UserService userService;
	@PostMapping("/questions")
    public ResponseEntity<List<CardDto>> getQuestions(@RequestBody Map<String, Object> data) {           
        
        return ResponseEntity.ok(cardGameService.getRandomQuestionsBySubjectExceptSolved(data));
    }
    
	/**
	 * 문제 제출 및 정답 체크
	 */
	
@PostMapping("/questions/submit")
public ResponseEntity<?> saveQuestionAttempts(@RequestBody List<CardSubDto> submissions) {
    try {
        cardGameService.saveQuestionAttempts(submissions);
        return ResponseEntity.ok(Map.of("success", true));
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "서버 오류"));
    }
}

    	/**
	 * 새로운 세션 ID 생성
	 */
	@GetMapping("/session/new")
	public ResponseEntity<String> generateNewSession() {
		try {
			String sessionId = cardGameService.generateSessionId();
			log.info("sessionId: "+sessionId);
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
		public Integer getUser_id() { return user_id; }
		public void setUser_id(Integer user_id) { this.user_id = user_id; }
		public Integer getQuestion_id() { return question_id; }
		public void setQuestion_id(Integer question_id) { this.question_id = question_id; }
		public String getSession_id() { return session_id; }
		public void setSession_id(String session_id) { this.session_id = session_id; }
		public boolean isIs_correct() { return is_correct; }
		public void setIs_correct(boolean is_correct) { this.is_correct = is_correct; }
		public String getSubmitted_answer() { return submitted_answer; }
		public void setSubmitted_answer(String submitted_answer) { this.submitted_answer = submitted_answer; }
	}
    
}
