package boot.infopass.service;

import java.util.Set;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RankingBatchService {

    private final RedisTemplate<String,Object> redisTemplate;
   
    private static final String REALTIME_RANKING_KEY="ranking:realtime";
    private static final String WEEKLY_RANKING_KEY="ranking:weekly";

    @Scheduled(cron="0 0 0 * * MON", zone="Asia/Seoul")
    public void backupWeeklyRanking(){
        ZSetOperations<String,Object> zSetOps= redisTemplate.opsForZSet();

        Set<ZSetOperations.TypedTuple<Object>>rankings=zSetOps.reverseRangeWithScores(REALTIME_RANKING_KEY,0,-1);
        if(rankings !=null){
            for(ZSetOperations.TypedTuple<Object> tuple : rankings){
                zSetOps.add(WEEKLY_RANKING_KEY,tuple.getValue(),tuple.getScore());
            }
        }
        redisTemplate.delete(REALTIME_RANKING_KEY);
    }

}
