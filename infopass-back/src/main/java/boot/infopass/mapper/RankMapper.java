package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.infopass.dto.RankedUserDto;

@Mapper
public interface RankMapper {
    List<RankedUserDto> getUserRankingsByIds(@Param("ids") List<Long> ids);
    List<RankedUserDto> getTopWeeklyRanks();
    List<RankedUserDto> getTopRealtimeRanks();
    
    
    public RankedUserDto selectByUserId(int userId);
}
