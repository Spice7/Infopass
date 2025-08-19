package boot.infopass.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.GameResultDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.GameResultService;
import boot.infopass.service.UserService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/results")
public class GameResultController {

	 private final GameResultService gameResultService;
	    private final UserService userService; // UserService 주입

	    public GameResultController(GameResultService gameResultService, UserService userService) {
	        this.gameResultService = gameResultService;
	        this.userService = userService;
	    }

	    @PostMapping("/save")
	    public ResponseEntity<String> saveGameResult(
	        @RequestBody GameResultDto gameResultDto,
	        @AuthenticationPrincipal CustomUser customUser) {
	        
	        // 1. (이미 존재하는) 게임 결과 저장 로직
	        // 이 부분에서 DB에 점수가 저장되고, 경험치가 업데이트된다고 가정합니다.
	        // 예시: gameResultService.saveAndAddExp(gameResultDto);
	        
	        // 2. 경험치 업데이트 후 레벨업 로직만 호출
	        int userId = customUser.getUserData().getId();
	        userService.checkAndProcessLevelUp(userId);

	        return ResponseEntity.ok("게임 결과 및 경험치 처리가 성공적으로 완료되었습니다.");
	    }

    // 로그인된 유저 기준으로 결과 조회 (POST)
    @PostMapping
    public List<GameResultDto> getUserResults(@AuthenticationPrincipal CustomUser customUser) {
        int userId = customUser.getUserData().getId();
        System.out.println("getUserResults called with userId: " + userId);
        return gameResultService.getAllResults(userId);
    }
    
    
}


