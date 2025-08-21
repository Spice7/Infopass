package boot.infopass.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.WrongAnswerDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.WrongAnswerService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/wrong-answers")
public class WrongAnswerController {

    private final WrongAnswerService wrongAnswerService;

    public WrongAnswerController(WrongAnswerService wrongAnswerService) {
        this.wrongAnswerService = wrongAnswerService;
    }

    // POST로 바꿈 (조회용 POST)
    @PostMapping
    public List<WrongAnswerDto> getWrongAnswersByToken(@AuthenticationPrincipal CustomUser customUser) {
        int userId = customUser.getUserData().getId();
        System.out.println("getWrongAnswersByToken called with userId: " + userId);
        return wrongAnswerService.findByUserId(userId);
    }

    // 블록 게임 전용: 특정 사용자 오답만 조회
    @GetMapping("/block/{userId}")
    public List<WrongAnswerDto> getBlockWrongsByUser(@PathVariable int userId) {
        return wrongAnswerService.findBlockWrongsByUserId(userId);
    }
}


