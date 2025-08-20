package boot.infopass.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.PlayCountByDayDto;

@Mapper
public interface AnalyticsMapper {
	List<PlayCountByDayDto> selectDailyPlays(Map<String, Object> params);
	List<Map<String, Object>> selectWrongTopQuestions(Map<String, Object> params);
	List<Map<String, Object>> selectMultiplayerRanking(Map<String, Object> params);
}


