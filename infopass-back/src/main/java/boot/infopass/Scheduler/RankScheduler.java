package boot.infopass.Scheduler;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.mapper.RankMapper;
import boot.infopass.service.RankingService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RankScheduler {
    private final RankingService rankingService;
    private final RankMapper rankMapper;

    @Scheduled(cron="0 0 0 * * MON")
    public void updateWeeklyRank(){
        List<RankedUserDto> weekly = rankMapper.getTopWeeklyRanks();
        if (weekly != null && !weekly.isEmpty()) {
            rankingService.cacheRankToRedis("rank:weekly", weekly);
        }
    }
}
