package boot.infopass.util;

import java.util.Set;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor

public class RedisUtil {
    private final StringRedisTemplate redisTemplate;

    public void addScoreToZSet(String key, String member,double score){
        redisTemplate.opsForZSet().incrementScore(key, member, score);
    }

    public Set<String> getTopRankers(String key, int limit){
        return redisTemplate.opsForZSet().reverseRange(key, 0, limit-1);
    }

    public void clearZset(String key){
        redisTemplate.delete(key);
    }

}
