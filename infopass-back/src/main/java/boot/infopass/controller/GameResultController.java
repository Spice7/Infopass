package boot.infopass.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.GameResultDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.GameResultService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/results")
public class GameResultController {

    private final GameResultService gameResultService;

    public GameResultController(GameResultService gameResultService) {
        this.gameResultService = gameResultService;
    }

    // 로그인된 유저 기준으로 결과 조회 (POST)
    @PostMapping
    public List<GameResultDto> getUserResults(@AuthenticationPrincipal CustomUser customUser) {
        int userId = customUser.getUserData().getId();
        System.out.println("getUserResults called with userId: " + userId);
        return gameResultService.getAllResults(userId);
    }
}


