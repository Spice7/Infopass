package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.MultiResultDto;
import boot.infopass.dto.OXQuizDto;
import boot.infopass.dto.OXQuizStatusDto;
import boot.infopass.dto.OXQuizSubDto;
import boot.infopass.dto.WrongAnswerDto;
import boot.infopass.mapper.LobbyMapper;
import boot.infopass.mapper.OXStatusMapper;
import boot.infopass.mapper.OXSubMapper;
import boot.infopass.mapper.OxQuizMapper;
import boot.infopass.mapper.WrongAnswerMapper;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/oxquiz")
public class OXQuizController {

	@Autowired
	OxQuizMapper mapper;
	@Autowired
	OXSubMapper submapper;
	@Autowired
	OXStatusMapper statusmapper;
	@Autowired
	WrongAnswerMapper wrongmapper;
	@Autowired
	LobbyMapper lobbymapper;
	
	@GetMapping("/quizlist")
	public List<OXQuizDto> GetAllQuiz() {
		return mapper.GetAllQuiz();
	}

	@PostMapping("/submitOXquiz")
	public void submituserscore(@RequestBody Map<String, Object> map, OXQuizSubDto dto) {
		
		 Integer userId = (Integer) map.get("user_id");
		 Integer quizId = (Integer) map.get("quiz_id");
		 String submittedAnswer = (String) map.get("submitted_answer");
		 boolean isCorrect = (boolean) map.get("is_correct");
		 Integer correct = (isCorrect ? 1 : 0);
		 System.out.println("userId: " + userId);
		 System.out.println("quizId: " + quizId);
		 System.out.println("answer: " + submittedAnswer);
		 System.out.println("correct?: " + isCorrect + " , " + correct);
		 dto.setUser_id(userId);
		 dto.setQuestion_id(quizId);
		 dto.setSubmitted_answer(submittedAnswer);
		 dto.setIs_correct(correct);
		submapper.insertOxSub(dto);
	}
	@PostMapping("/wronganswer")
	public void insertwrong(@RequestBody Map<String , Object> map, WrongAnswerDto dto) {
		Integer userId = (Integer) map.get("user_id");
		String game_type = (String) map.get("game_type");
		Integer question_id = (Integer) map.get("question_id");
		String submittedAnswer = (String) map.get("submitted_answer");
		
		dto.setUserId(userId);
		dto.setGameType(game_type);
		dto.setQuestionId(question_id);
		dto.setSubmittedAnswer(submittedAnswer);
		wrongmapper.insertWrongAnswer(dto);
		
		
	}
	
	@PostMapping("/InsertUserStatus")
	public void inertuserstatus(@RequestBody Map<String, Object> map, OXQuizStatusDto dto) {
	    Integer userId = (Integer) map.get("user_id");
	    Integer userScore = (Integer) map.get("user_score");

	    Object remainTimeObj = map.get("remain_time");
	    Float remainTime = 0.0f;

	    if (remainTimeObj instanceof Number) {
	        remainTime = ((Number) remainTimeObj).floatValue();
	    }

//	    System.out.println("user_id : " + userId);
//	    System.out.println("user_score : " + userScore);
//	    System.out.println("remain_time : " + remainTime);

	    dto.setUser_id(userId);
	    dto.setUser_score(userScore);
	    dto.setRemain_time(remainTime);

	    statusmapper.UserStatus(dto);
	}
	
	//멀티게임 방 
	@PostMapping("/EndGame")
	public void postMethodName(@RequestBody Map<String, Object> map, MultiResultDto dto) {
			
		

	}
	
	

}
