package boot.infopass.service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.RankMapper;
import boot.infopass.mapper.UserMapper;
import boot.infopass.util.RedisUtil;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RankingService {
    
    private final RedisUtil redisUtil;
    private final RankMapper rankMapper;
    
    public List<RankedUserDto> getRank(String type){
        String redisKey=type.equals("weekly")?"rank:weekly" :"rank:realtime";
        Set<String> ids=redisUtil.getTopRankers(redisKey,30);

        if(ids==null||ids.isEmpty()){
            List<RankedUserDto> fallback=type.equals("weekly")
            ?rankMapper.getTopWeeklyRanks()
            :rankMapper.getTopRealtimeRanks();

            fallback.forEach(user->
            redisUtil.addScoreToZSet(redisKey, user.getUserId().toString(),user.getTotalScore()));
            return fallback;
        }

        List<Long> userIds=ids.stream().map(Long::parseLong).toList();
        return rankMapper.getUserRankingByIds(userIds);
    }

}
