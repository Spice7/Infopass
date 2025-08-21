package boot.infopass.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import boot.infopass.dto.PlayCountByDayDto;
import boot.infopass.mapper.AnalyticsMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

	private final AnalyticsMapper analyticsMapper;

	public List<PlayCountByDayDto> getDailyPlays(LocalDate from, LocalDate to) {
		Map<String, Object> params = new HashMap<>();
		params.put("from", from.atStartOfDay(ZoneId.systemDefault()).toInstant());
		params.put("to", to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
		return analyticsMapper.selectDailyPlays(params);
	}

	public List<Map<String, Object>> getWrongTopQuestions(LocalDate from, LocalDate to, String gameType, int limit) {
		Map<String, Object> params = new HashMap<>();
		params.put("from", from.atStartOfDay(ZoneId.systemDefault()).toInstant());
		params.put("to", to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
		params.put("gameType", gameType);
		params.put("limit", limit);
		return analyticsMapper.selectWrongTopQuestions(params);
	}

	public List<Map<String, Object>> getMultiplayerRanking(LocalDate from, LocalDate to, String gameType) {
		Map<String, Object> params = new HashMap<>();
		params.put("from", from.atStartOfDay(ZoneId.systemDefault()).toInstant());
		params.put("to", to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
		params.put("gameType", gameType);
		return analyticsMapper.selectMultiplayerRanking(params);
	}
}


