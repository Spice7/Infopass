package boot.infopass.controller;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.service.RankingService;
import boot.infopass.util.RedisUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/rank")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = { RequestMethod.GET,
        RequestMethod.OPTIONS }, allowCredentials = "true")
public class RankingController {
    private final RankingService rankingService;
    private final RedisUtil redisUtil;

    @GetMapping()
    public List<RankedUserDto> getRanking(@RequestParam String type) {
        return rankingService.getRank(type);
    }

    @GetMapping("/init-test-data")
    public ResponseEntity<String> initializeTestData() {
        redisUtil.initializeTestData();
        return ResponseEntity.ok("테스트 데이터가 초기화되었습니다.");
    }

}
