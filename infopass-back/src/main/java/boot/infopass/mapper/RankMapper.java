package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.RankedUserDto;
import io.lettuce.core.dynamic.annotation.Param;

@Mapper
public interface RankMapper {
    List<RankedUserDto>getUserRankingsByIds(@Param("ids")List<Long> ids);


}
