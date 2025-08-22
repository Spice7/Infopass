package boot.infopass.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.AdminUserStatsDto;
import boot.infopass.dto.PlayCountByDayDto;
import boot.infopass.dto.UserDto;
import boot.infopass.service.AdminService;
import boot.infopass.service.AnalyticsService;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AnalyticsService analyticsService;
	private final AdminService adminService;

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

	// ==================== 사용자 관리 API ====================
	
	/**
	 * 모든 사용자 목록 조회
	 */
	@GetMapping("/users")
	public ResponseEntity<List<UserDto>> getAllUsers() {
		try {
			List<UserDto> users = adminService.getAllUsers();
			return ResponseEntity.ok(users);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 특정 사용자 조회
	 */
	@GetMapping("/users/{id}")
	public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
		try {
			UserDto user = adminService.getUserById(id);
			if (user != null) {
				return ResponseEntity.ok(user);
			} else {
				return ResponseEntity.notFound().build();
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 사용자 정보 수정
	 */
	@PutMapping("/users/{id}")
	public ResponseEntity<UserDto> updateUser(@PathVariable Integer id, @RequestBody UserDto userDto) {
		try {
			UserDto updatedUser = adminService.updateUser(id, userDto);
			if (updatedUser != null) {
				return ResponseEntity.ok(updatedUser);
			} else {
				return ResponseEntity.notFound().build();
			}
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 새 사용자 추가
	 */
	@PostMapping("/users")
	public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
		try {
			UserDto newUser = adminService.createUser(userDto);
			return ResponseEntity.ok(newUser);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
	
	/**
	 * 사용자 삭제 (실제로는 비활성화)
	 */
	@DeleteMapping("/users/{id}")
	public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Integer id) {
		try {
			boolean result = adminService.deleteUser(id);
			Map<String, String> response = Map.of(
				"message", result ? "사용자가 삭제되었습니다." : "사용자 삭제에 실패했습니다.",
				"success", String.valueOf(result)
			);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			Map<String, String> response = Map.of(
				"message", e.getMessage(),
				"success", "false"
			);
			return ResponseEntity.badRequest().body(response);
		}
	}
	
	/**
	 * 사용자 상태 토글 (활성/비활성)
	 */
	@PutMapping("/users/{id}/toggle-status")
	public ResponseEntity<Map<String, String>> toggleUserStatus(@PathVariable Integer id) {
		try {
			boolean result = adminService.toggleUserStatus(id);
			Map<String, String> response = Map.of(
				"message", result ? "사용자 상태가 변경되었습니다." : "사용자 상태 변경에 실패했습니다.",
				"success", String.valueOf(result)
			);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			Map<String, String> response = Map.of(
				"message", e.getMessage(),
				"success", "false"
			);
			return ResponseEntity.badRequest().body(response);
		}
	}
	
	/**
	 * 사용자 통계 조회
	 */
	@GetMapping("/users/stats")
	public ResponseEntity<AdminUserStatsDto> getUserStats() {
		try {
			AdminUserStatsDto stats = adminService.getUserStats();
			return ResponseEntity.ok(stats);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
}
