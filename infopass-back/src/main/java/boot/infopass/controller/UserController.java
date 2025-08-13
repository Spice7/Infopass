package boot.infopass.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.MultiplayerDto;
import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUser;
import boot.infopass.security.JwtTokenProvider;
import boot.infopass.service.MultiplayerService;
import boot.infopass.service.SocialAuthService;
import boot.infopass.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/user")
public class UserController {

    private final SocialAuthService socialAuthService;

    private final MultiplayerService multiplayerService;

	@Autowired
	UserService userService;
	// ResponseEntity : 상태 코드, 헤더, 본문을 모두 포함하는 HTTP 응답을 유연하게 구성할 수 있는 Spring의 핵심 클래스


	
	@Autowired
	JwtTokenProvider jwtTokenProvider;

    UserController(MultiplayerService multiplayerService, SocialAuthService socialAuthService) {
        this.multiplayerService = multiplayerService;
        this.socialAuthService = socialAuthService;
    }
	
	@PostMapping("/checkId")
	public boolean findById(@RequestBody UserDto userDto) {
		String email = userDto.getEmail();
		return userService.findById(email);
	}

	@PostMapping("/checkNickName")
	public boolean findByNickName(@RequestBody UserDto userDto) {
		log.info(userDto.getNickname());
		return userService.findByNickName(userDto.getNickname());
	}

	@PostMapping("/sendSms")
    public ResponseEntity<Map<String, String>> sendSms(@RequestBody UserDto userDto) {
        Map<String, String> result = userService.sendSms(userDto.getPhone());
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verifyCode")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> data) {
        String token = data.get("smsToken"); // React에서 받은 SMS 토큰
        String inputCode = data.get("code"); // 사용자가 입력한 인증번호

        Map<String, String> tokenData = jwtTokenProvider.parseSmsToken(token);
        log.info(inputCode);
        if (tokenData == null || tokenData.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰이거나 만료되었습니다.");
        }

        String phoneFromToken = tokenData.get("phone");
        String codeFromToken = tokenData.get("smsCode");

        if (!inputCode.equals(codeFromToken)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증번호가 일치하지 않습니다.");
        }

        UserDto user = userService.findByPhone(phoneFromToken);

        if (user != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 가입된 휴대폰 번호입니다.");
        } else {
            return ResponseEntity.ok("사용 가능한 휴대폰 번호입니다.");
        }
    }

	// 사용자 정보 조회
	@PostMapping("/info")
	public ResponseEntity<?> userInfo(@AuthenticationPrincipal CustomUser customUser) {

		log.info("::::: customUser :::::");
		log.info("customUser : " + customUser);

		UserDto userDto = customUser.getUserDto();
		log.info("userDto : " + userDto);

		// 인증된 사용자 정보
		if (userDto != null)
			return new ResponseEntity<>(userDto, HttpStatus.OK);

		// 인증 되지 않음
		return new ResponseEntity<>("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
	}

	// 회원가입
	@PostMapping("/join")
	public ResponseEntity<?> insertUser(@RequestBody UserDto userDto) {
		UserDto savedUser = userService.insertUser(userDto);
		
		MultiplayerDto mDto = new MultiplayerDto();
		mDto.setUser_id(savedUser.getId());
		int result1 = multiplayerService.insertMultiplayer(mDto);
		log.info("id: "+savedUser.getId());
		if (savedUser.getId() > 0 && result1 > 0) {
			log.info("회원가입 성공! - SUCCESS");
			return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
		} else {
			log.info("회원가입 실패! - FAIL");
			return new ResponseEntity<>("FAIL", HttpStatus.BAD_REQUEST);
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<UserDto> updateUser(@PathVariable("id") Long id, @RequestBody UserDto updatedUserDto) {
		UserDto updatedUser = userService.updateUser(id, updatedUserDto);
		if (updatedUser != null) {
			return ResponseEntity.ok(updatedUser);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

}
