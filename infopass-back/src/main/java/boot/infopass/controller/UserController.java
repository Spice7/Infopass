package boot.infopass.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.UserService;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestController
@CrossOrigin( origins = "http://localhost:5173")
@RequestMapping("/user")
public class UserController {
	
	
	@Autowired
	UserService userService;
	//ResponseEntity : 상태 코드, 헤더, 본문을 모두 포함하는 HTTP 응답을 유연하게 구성할 수 있는 Spring의 핵심 클래스
	
	
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

	
	//사용자 정보 조회
    @PostMapping("/info")
    public ResponseEntity<?> userInfo(@AuthenticationPrincipal CustomUser customUser) {
        
        log.info("::::: customUser :::::");
        log.info("customUser : "+ customUser);

        UserDto userDto = customUser.getUserDto();
        log.info("userDto : " + userDto);

        // 인증된 사용자 정보 
        if( userDto != null )
            return new ResponseEntity<>(userDto, HttpStatus.OK);

        // 인증 되지 않음
        return new ResponseEntity<>("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
	
	// 회원가입
	@PostMapping("/join")
	public ResponseEntity<?> insertUser(@RequestBody UserDto userDto){
		int result = userService.insertUser(userDto);

        if( result > 0 ) {
           log.info ("회원가입 성공! - SUCCESS");
            return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
        }
        else {
            log.info("회원가입 실패! - FAIL");
            return new ResponseEntity<>("FAIL", HttpStatus.BAD_REQUEST);
        } 
	}
	
	
	
	
	
	 


}
