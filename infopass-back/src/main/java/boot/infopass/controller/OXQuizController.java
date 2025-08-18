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

import boot.infopass.dto.GameResultDto;
import boot.infopass.dto.LobbyDto;
import boot.infopass.dto.OXQuizDto;
import boot.infopass.dto.OXQuizStatusDto;
import boot.infopass.dto.OXQuizSubDto;
import boot.infopass.dto.UserDto;
import boot.infopass.dto.WrongAnswerDto;
import boot.infopass.mapper.LobbyMapper;
import boot.infopass.mapper.GameResultMapper;
import boot.infopass.mapper.OXStatusMapper;
import boot.infopass.mapper.OXSubMapper;
import boot.infopass.mapper.OxQuizMapper;
import boot.infopass.mapper.UserMapper;
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
	@Autowired
	GameResultMapper resultmapper;
	@Autowired
	UserMapper usermapper;
	@Autowired
	MultiplayerMapper multimapper;
	
	@GetMapping("/quizlist")
	public List<OXQuizDto> GetAllQuiz() {
		return mapper.GetAllQuiz();
	}
	
	//========================
	// 싱글 게임 기록 저장용
	//============================
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
	    
	    UserDto udto = new UserDto();
	    udto.setId(userId);
	    udto.setExp(userScore*5);
	    
	    statusmapper.UserStatus(dto);
	    usermapper.updateUserExp(udto);
	}
	
	
	//========================
	// 멀티 게임 기록 저장용
	//============================
	@PostMapping("/EndGame") // 게임끝 처리
	public void postMethodName(@RequestBody Map<String, Object> map, LobbyDto dto) {
			
		Integer host_user_id = Integer.parseInt(map.get("host_user_id").toString());
		Integer id = Integer.parseInt(map.get("roomid").toString());
		String status = map.get("status").toString();
		
		System.out.println(host_user_id + "  |  " + id + "  |  " + status);
		dto.setHost_user_id(host_user_id);
		dto.setId(id);
		dto.setStatus(status);
		
		lobbymapper.endedStatus(dto);
	}
	
	@PostMapping("/multiresult")
	public void CreateResult(@RequestBody Map<String, Object> map, GameResultDto dto) {
		Integer lobbyId = Integer.parseInt(map.get("lobby_id").toString());
		Integer userId = Integer.parseInt(map.get("user_id").toString());
		Integer score = Integer.parseInt(map.get("score").toString());
		Integer userRank = Integer.parseInt(map.get("user_rank").toString());
		Integer userRankPoint = Integer.parseInt(map.get("user_rank_point").toString());
		String gameType = (String)map.get("game_type");
		
		
		System.out.println(lobbyId + "  |  " + userId + "  |  " + score + "  |  " + userRank + "  |  " + userRankPoint + "  |  " + gameType );
		dto.setLobbyId(lobbyId);
		dto.setUserId(userId);
		dto.setScore(score);
		dto.setUserRank(userRank);
		dto.setUserRankPoint(userRankPoint);
		dto.setGameType(gameType);
		
		Integer OldBestScore =  multimapper.GetBestScore(userId) ;
		MultiplayerDto mdto = new MultiplayerDto();
		System.out.println(userId + "의 점수 : " + OldBestScore +  "  |  " + score );
		mdto.setScore(score);
		mdto.setBest_score(OldBestScore >= score ?  OldBestScore : score);
		mdto.setUser_id(userId);
		multimapper.updateMultiRank(mdto);
		resultmapper.CreateResult(dto);
		
	}

}
