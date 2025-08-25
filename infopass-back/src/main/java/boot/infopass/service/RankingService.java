package boot.infopass.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.RankMapper;
import boot.infopass.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final RedisUtil redisUtil;
    private final RankMapper rankMapper;

    // 기존 saveUserRank 유지 (player_rank는 0으로 넣고 스케줄/배치에서 채움)
    public void saveUserRank(Long userId, int totalScore) {
        rankMapper.upsertUserRankAndPlayerRank(userId, totalScore, 0);
        redisUtil.addScoreToZSet("rank:realtime", userId.toString(), totalScore);
    }

    // Redis ZSET을 순회해서 DB에 순위 반영(실무: 배치/관리자 호출용)
    @Transactional
    public void persistRedisRanksToDb(String redisKey) {
        // RedisUtil에 scores와 value를 함께 반환하는 유틸이 필요합니다.
        Set<ZSetOperations.TypedTuple<String>> entries = redisUtil.zRevRangeWithScores(redisKey, 0, -1);
        if (entries == null || entries.isEmpty())
            return;
        int rank = 1;
        for (ZSetOperations.TypedTuple<String> t : entries) {
            Long uid = Long.valueOf(t.getValue());
            int totalScore = t.getScore().intValue();
            rankMapper.upsertUserRankAndPlayerRank(uid, totalScore, rank);
            rank++;
        }
    }

    @Transactional
    public void recalculateRanksFromDb() {
        rankMapper.recalculateAllPlayerRanks();
    }

    @Scheduled(cron = "0 48 12 * * ?")
    public void updatePlayerRanksInDb() {
        System.out.println("updateing all player ranks in db");
        rankMapper.recalculateAllPlayerRanks();
        System.out.println("player ranks updated successfully");
    }

    public List<RankedUserDto> getRank(String type) {
        String redisKey = type.equals("weekly") ? "rank:weekly" : "rank:realtime";

        // Redis에서 데이터를 가져오려고 시도
        Set<String> ids = redisUtil.getTopRankers(redisKey, 30);

        if (ids == null || ids.isEmpty()) {
            // Redis에 데이터가 없으면 DB에서 직접 가져오기
            List<RankedUserDto> fallback = type.equals("weekly")
                    ? rankMapper.getTopWeeklyRanks()
                    : rankMapper.getTopRealtimeRanks();

            // Redis에 캐시 저장
            if (fallback != null && !fallback.isEmpty()) {
                fallback.forEach(
                        user -> redisUtil.addScoreToZSet(redisKey, user.getId().toString(), user.getTotalScore()));
            }
            return fallback != null ? fallback : new ArrayList<>();
        }

        // Redis에서 가져온 ID로 상세 정보 조회
        List<Long> userIds = ids.stream().map(Long::parseLong).collect(Collectors.toList());
        return rankMapper.getUserRankingsByIds(userIds);
    }

    public void cacheRankToRedis(String key, List<RankedUserDto> rankings) {
        if (rankings != null && !rankings.isEmpty()) {
            rankings.forEach(user -> redisUtil.addScoreToZSet(key, user.getId().toString(), user.getTotalScore()));
        }
    }

    public RankedUserDto getRankByUserId(int userId) {
        return rankMapper.selectByUserId(userId);
    }
}
