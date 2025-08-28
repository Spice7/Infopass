package boot.infopass.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import boot.infopass.service.SocialAuthService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth/callback")
public class AuthCallbackController {
    
    private final SocialAuthService socialAuthService;

    public AuthCallbackController(SocialAuthService socialAuthService) {
        this.socialAuthService = socialAuthService;
    }

    @GetMapping("/{provider}")
    public RedirectView socialCallback(
            @PathVariable("provider") String provider,
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state) {
        
        log.info("소셜 로그인 콜백 - provider={}, code={}, state={}", provider, code, state);

        try {
            Map<String, Object> result = socialAuthService.socialSignup(provider, code, state);
            
            // 프론트엔드로 결과와 함께 리다이렉트
            String frontendUrl = System.getenv("VITE_FRONTEND_URL");
            if (frontendUrl == null || frontendUrl.isEmpty()) {
                frontendUrl = "http://localhost:5173";
            }
            
            if (result.containsKey("error")) {
                // 오류 발생 시 에러 페이지로 리다이렉트
                return new RedirectView(frontendUrl + "?error=" + result.get("error"));
            }
            
            if (Boolean.TRUE.equals(result.get("login"))) {
                // 기존 회원 로그인 성공
                String token = (String) result.get("token");
                return new RedirectView(frontendUrl + "?token=" + token + "&login=success");
            } else {
                // 신규 회원 - 회원가입 페이지로 리다이렉트
                return new RedirectView(frontendUrl + "?signup=required&provider=" + provider);
            }
            
        } catch (Exception e) {
            log.error("소셜 로그인 콜백 처리 중 오류", e);
            String frontendUrl = System.getenv("VITE_FRONTEND_URL");
            if (frontendUrl == null || frontendUrl.isEmpty()) {
                frontendUrl = "http://localhost:5173";
            }
            return new RedirectView(frontendUrl + "?error=callback_failed");
        }
    }
}
