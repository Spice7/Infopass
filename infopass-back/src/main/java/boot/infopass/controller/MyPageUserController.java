package boot.infopass.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/mypage")
public class MyPageUserController {

    private final UserService userService;

    public MyPageUserController(UserService userService) {
        this.userService = userService;
    }

    // JWT 인증된 사용자 정보로 마이페이지 조회
    @GetMapping("/me")
    public ResponseEntity<?> getMyPageUserInfo(@AuthenticationPrincipal CustomUser customUser) {
        log.info("::::: [마이페이지] 인증된 사용자 정보 호출 :::::");
        log.info("customUser : {}", customUser);

        if (customUser == null) {
            return new ResponseEntity<>("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
        }

        // userId 타입이 int가 아니라 String일 수도 있으니 변환 주의
        int userId = customUser.getUserDto().getId();

        UserDto userDto = userService.getUserData(userId); // UserService에 getUserById 메서드가 있어야 합니다.

        if (userDto == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    
}
