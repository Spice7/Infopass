package boot.infopass.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.RankMapper;
import boot.infopass.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ZSetOperations;



@Service
@RequiredArgsConstructor
public class RankingService {

    private final RedisUtil redisUtil;
    private final RankMapper rankMapper;

    public List<RankedUserDto> getRank(String type){
        String redisKey = type.equals("weekly") ? "rank:weekly" : "rank:realtime";
        
        // Redis에서 데이터를 가져오려고 시도
        Set<String> ids = redisUtil.getTopRankers(redisKey, 30);

        if(ids == null || ids.isEmpty()){
            // Redis에 데이터가 없으면 DB에서 직접 가져오기
            List<RankedUserDto> fallback = type.equals("weekly")
                ? rankMapper.getTopWeeklyRanks()
                : rankMapper.getTopRealtimeRanks();

            // Redis에 캐시 저장
            if (fallback != null && !fallback.isEmpty()) {
                fallback.forEach(user ->
                    redisUtil.addScoreToZSet(redisKey, user.getId().toString(), user.getTotalScore()));
            }
            return fallback != null ? fallback : new ArrayList<>();
        }

        // Redis에서 가져온 ID로 상세 정보 조회
        List<Long> userIds = ids.stream().map(Long::parseLong).collect(Collectors.toList());
        return rankMapper.getUserRankingsByIds(userIds);
    }

    public void cacheRankToRedis(String key, List<RankedUserDto> rankings) {
        if (rankings != null && !rankings.isEmpty()) {
            rankings.forEach(user ->
                redisUtil.addScoreToZSet(key, user.getId().toString(), user.getTotalScore()));
        }
    }
}
