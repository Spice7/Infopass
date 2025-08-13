package boot.infopass.util;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisUtil {
    private final RedisTemplate<String, Object> redisTemplate;

    public RedisUtil(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Redis Sorted Set에서 상위 랭킹을 가져옵니다.
     * getTopRankings 메소드가 다른 파일에서 getTopRankers로 호출되고 있어 이름을 변경했습니다.
     * 
     * @param key   Redis 키
     * @param count 가져올 랭킹 수
     * @return 상위 랭킹 ID Set
     */
    public Set<String> getTopRankers(String key, int count) {
        Set<Object> redisResult = redisTemplate.opsForZSet().reverseRange(key, 0, count - 1);
        if (redisResult == null) {
            return Collections.emptySet();
        }
        return redisResult.stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    /**
     * Redis Sorted Set에 점수를 추가합니다.
     * 
     * @param key    Redis 키
     * @param member 사용자 ID
     * @param score  점수
     */
    public void addScoreToZSet(String key, String member, int score) {
        redisTemplate.opsForZSet().add(key, member, score);
    }

}
