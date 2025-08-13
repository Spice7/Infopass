package boot.infopass.controller;

import java.util.Map;

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
@CrossOrigin(origins = "http://localhost:5173")
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

        Object codeObj = map.get("code");
        if (codeObj instanceof Map) {
            Map<String, String> codeMap = (Map<String, String>) codeObj;
            String code = codeMap.get("code");
            String state = codeMap.get("state");

        log.info("provider={}, code={}, state={}", provider, code, state);

        try {
            Map<String, Object> result = socialAuthService.socialSignup(provider, code, state);
           

            if (result.containsKey("error")) {
            	log.info("result: "+result);
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
	        } catch (Exception e) {
	            log.error("socialLogin error", e);
	            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
	        }           
       
	    } else {
	        // 예외 처리: code가 예상과 다를 때
	        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request body format"));
	    }

	}
}
