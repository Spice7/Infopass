package boot.infopass.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.RankMapper;
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
        return rankMapper.getUserRankingsByIds(userIds);
    }

}
