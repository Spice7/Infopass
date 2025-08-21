package boot.infopass.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.PlayCountByDayDto;
import boot.infopass.service.AnalyticsService;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AnalyticsService analyticsService;

	@GetMapping("/ping")
	public String ping() {
		return "admin";
	}

	@GetMapping("/stats/daily-plays")
	public List<PlayCountByDayDto> getDailyPlays(
			@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
	) {
		return analyticsService.getDailyPlays(from, to);
	}

	@GetMapping("/stats/wrong-top")
	public List<Map<String, Object>> getWrongTop(
			@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
			@RequestParam(value = "gameType", required = false) String gameType,
			@RequestParam(value = "limit", defaultValue = "10") int limit
	) {
		return analyticsService.getWrongTopQuestions(from, to, gameType, limit);
	}

	@GetMapping("/stats/multi-ranking")
	public List<Map<String, Object>> getMultiRanking(
			@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
			@RequestParam(value = "gameType", required = false) String gameType
	) {
		return analyticsService.getMultiplayerRanking(from, to, gameType);
	}
}
