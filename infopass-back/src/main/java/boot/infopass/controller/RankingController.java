package boot.infopass.controller;

import java.util.List;

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

    @PostMapping("/recalculate")
    public ResponseEntity<String> recalcNow() {
        rankingService.recalculateRanksFromDb();
        return ResponseEntity.ok("recalculated");
    }

    // 관리자/테스트용: Redis -> DB 동기화
    @PostMapping("/persistRedis")
    public ResponseEntity<String> persistRedis(@RequestParam(defaultValue = "rank:realtime") String key) {
        rankingService.persistRedisRanksToDb(key);
        return ResponseEntity.ok("persisted");
    }

}
