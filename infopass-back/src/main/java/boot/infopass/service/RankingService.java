package boot.infopass.service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.UserMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final RedisTemplate<String,Object>redisTemplate;
    private final UserMapper userMapper;

    public String getCurrentWeekKey(){
        LocalDate now = LocalDate.now();
        WeekFields weekFields=WeekFields.of(Locale.getDefault());
        int week=now.get(weekFields.weekOfWeekBasedYear());
        int year=now.getYear();
        return year+"-W"+week;
    }

    public List<RankedUserDto> getTopRank(String key,int limit){
        Set<ZSetOperations.TypedTuple<Object>> redisResult=
        redisTemplate.opsForZSet().reverseRangeWidthScores(key,0,limit-1);

        if(redisResult==null || redisResult.isEmpty()){
            return new ArrayList<>();
        }
        List<Long>userIds=redisResult.stream()
            .map(t->Long.valueOf((String)t.getValue()))
            .collect(Collectors.toList());

        Map<Long,RankedUserDto> userInfoMap=userMapper.findUsersByIds(userIds)
        .stream().collect(Collectors.toMap(RankedUserDto::getUserId,u->u));

        return redisResult.stream().map(t->{
            Long userId=Long.valueOf((String)t.getValue());
            int score=t.getScore().intValue();
            RankedUserDto dto=userInfoMap.getOrDefault(userId,new RankedUserDto(userId,"알수없음","",score));
            dto.setScore(score);
            return dto;
        }).collect(Collectors.toList());
        
    }
}
