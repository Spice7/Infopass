package boot.infopass.util;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.DefaultTypedTuple;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

@Component
public class RedisUtil {
    private final RedisTemplate<String, Object> redisTemplate;

    public RedisUtil(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addScoreToZSet(String key, String member, double score) {
        redisTemplate.opsForZSet().add(key, member, score);
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

    // Redis Sorted Set에서 score 포함 전체 엔트리(내림차순: 높은 점수부터) 반환
    public Set<ZSetOperations.TypedTuple<String>> zRevRangeWithScores(String key, int start, int end) {
        Set<ZSetOperations.TypedTuple<Object>> raw = redisTemplate.opsForZSet().reverseRangeWithScores(key, start, end);
        if (raw == null || raw.isEmpty())
            return Collections.emptySet();

        LinkedHashSet<ZSetOperations.TypedTuple<String>> result = new LinkedHashSet<>();
        for (ZSetOperations.TypedTuple<Object> t : raw) {
            String member = String.valueOf(t.getValue());
            Double score = t.getScore();
            result.add(new DefaultTypedTuple<>(member, score));
        }
        return result;
    }

    // 특정 멤버의 내림차순 랭크(0 기반) 반환
    public Long zRevRank(String key, String member) {
        ZSetOperations<String, Object> zOps = redisTemplate.opsForZSet();
        return zOps.reverseRank(key, member);
    }
}
