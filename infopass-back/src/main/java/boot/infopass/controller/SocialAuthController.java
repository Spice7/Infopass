package boot.infopass.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import boot.infopass.service.SocialAuthService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/user")
public class SocialAuthController {
	
    private final SocialAuthService socialAuthService;

    public SocialAuthController(SocialAuthService socialAuthService) {
        this.socialAuthService = socialAuthService;
    }

	@PostMapping("/social/{provider}")
    public ResponseEntity<?> socialLogin(
            @PathVariable("provider") String provider,
            @RequestBody Map<String, Object> map) {
        String code = null;
        String state = null;
        Object codeObj = map.get("code");
        if (codeObj instanceof Map) {
            Map<String, String> codeMap = (Map<String, String>) codeObj;
            code = codeMap.get("code");
            state = codeMap.get("state");
        } else if (codeObj instanceof String) {
            code = (String) codeObj;
            state = (String) map.get("state");
        } else {
	        // 예외 처리: code가 예상과 다를 때
	        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request body format"));
	    }
        log.info("provider={}, code={}, state={}", provider, code, state);

        try {
            Map<String, Object> result = socialAuthService.socialSignup(provider, code, state);

            if (result.containsKey("error")) {
            	log.info("result: "+result);
                return ResponseEntity.badRequest().body(result);
            }
             // 로그인/회원가입 분기 응답
            if (Boolean.TRUE.equals(result.get("login"))) {
                // 이미 회원 → 바로 로그인 처리
                return ResponseEntity.ok(result);
            } else {
                // 신규 회원 → 회원가입 폼 안내
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            }
	        } catch (Exception e) {
	            log.error("socialLogin error", e);
	            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
	        }
	}

}
