package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.GameResultDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.GameResultService;
import boot.infopass.service.UserService;

@RestController
@RequestMapping("/results")
public class GameResultController {

	 private final GameResultService gameResultService;
	 private final UserService userService; // UserService 주입

	 public GameResultController(GameResultService gameResultService, UserService userService) {
	     this.gameResultService = gameResultService;
	     this.userService = userService;
	 }

	 // 요청 본문을 받지 않도록 @RequestBody를 제거했습니다.
	 @PostMapping("/level")
	 public ResponseEntity<String> ExpResult(
	     @AuthenticationPrincipal CustomUser customUser) {
	     
	     // 경험치 업데이트 후 레벨업 로직만 호출
	     if (customUser == null || customUser.getUserData() == null) {
	     	return ResponseEntity.status(401).body("Unauthorized");
	     }
	     int userId = customUser.getUserData().getId();
	     userService.checkAndProcessLevelUp(userId);

	     return ResponseEntity.ok("게임 결과 및 경험치 처리가 성공적으로 완료되었습니다.");
	 }

	
	// 공용 경험치 증감 API
	// POST /results/exp
	// RequestBody: { "expDelta": number }
	// 로그인된 사용자 기준으로 exp를 증감하고, 레벨업을 처리한 뒤 현재 exp/level을 반환
	@PostMapping("/exp")
	public ResponseEntity<?> applyExp(
	        @AuthenticationPrincipal CustomUser customUser,
	        @RequestBody(required = true) java.util.Map<String, Object> body
	) {
	    if (customUser == null || customUser.getUserData() == null) {
	    	return ResponseEntity.status(401).body("Unauthorized");
	    }
	    int userId = customUser.getUserData().getId();
	    Object deltaObj = body.get("expDelta");
	    if (!(deltaObj instanceof Number)) {
	        return ResponseEntity.badRequest().body("경험치가 입력되지 않았거나 형식이 맞지 않습니다 (number타입)");
	    }
	    int expDelta = ((Number) deltaObj).intValue();

	    var updated = userService.applyExpAndProcessLevel(userId, expDelta);
	    if (updated == null) {
	        return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다");
	    }

	    Map<String, Object> resp = new java.util.HashMap<>();
	    resp.put("userId", updated.getId());
	    resp.put("addedExp", expDelta);
	    resp.put("exp", updated.getExp());
	    resp.put("level", updated.getLevel());
	    return ResponseEntity.ok(resp);
	}

	// 파라미터 (유저, 증가/감소할 경험치)
	// POST /results/exp/apply
	@PostMapping("/exp/apply")
	public ResponseEntity<?> applyExpRaw(
			@AuthenticationPrincipal CustomUser customUser,
			@RequestBody(required = true) Object body
	) {
		if (customUser == null || customUser.getUserData() == null) {
			return ResponseEntity.status(401).body("Unauthorized");
		}
		Integer delta;
		if (body instanceof Number) {
			delta = ((Number) body).intValue();
		} else if (body instanceof java.util.Map<?, ?> map) {
			Object v = map.get("expDelta");
			if (v instanceof Number) {
				delta = ((Number) v).intValue();
			} else {
				return ResponseEntity.badRequest().body("경험치가 입력되지 않았거나 형식이 맞지 않습니다 (number타입)");
			}
		} else {
			return ResponseEntity.badRequest().body("지원하지 않는 본문 형식입니다");
		}
		int userId = customUser.getUserData().getId();
		var updated = userService.applyExpAndProcessLevel(userId, delta);
		if (updated == null) {
			return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다");
		}
		java.util.Map<String, Object> resp = new java.util.HashMap<>();
		resp.put("userId", updated.getId());
		resp.put("addedExp", delta);
		resp.put("exp", updated.getExp());
		resp.put("level", updated.getLevel());
		return ResponseEntity.ok(resp);
	}

    // 로그인된 유저 기준으로 결과 조회 (POST)
    @PostMapping
    public List<GameResultDto> getUserResults(@AuthenticationPrincipal CustomUser customUser) {
        int userId = customUser.getUserData().getId();
        System.out.println("getUserResults called with userId: " + userId);
        return gameResultService.getAllResults(userId);
    }
}