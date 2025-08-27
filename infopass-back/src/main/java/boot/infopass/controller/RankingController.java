package boot.infopass.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.service.RankingService;
import boot.infopass.util.RedisUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rank")
@RequiredArgsConstructor
public class RankingController {
    private final RankingService rankingService;
    private final RedisUtil redisUtil;

    @GetMapping()
    public List<RankedUserDto> getRanking(@RequestParam("type") String type) {
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

    @GetMapping("/{id}")
    public ResponseEntity<RankedUserDto> getUserRank(@PathVariable("id") int userId) {
        RankedUserDto rank = rankingService.getRankByUserId(userId);
        return ResponseEntity.ok(rank);
    }

}
