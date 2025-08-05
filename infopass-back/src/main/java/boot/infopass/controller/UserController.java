package boot.infopass.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUserDetailService;
import boot.infopass.service.UserService;


@RestController
@CrossOrigin( origins = "http://localhost:5174")
@RequestMapping("/user")
public class UserController {

	@Autowired
	CustomUserDetailService customUserDetailService;
	
	@Autowired
	UserService userService;
	
	/**
     * 이메일 중복 확인 API
     * 클라이언트에서 이메일을 JSON 본문으로 POST 요청합니다.
     * 유효성 검사 후, 서비스 계층을 통해 중복 여부를 확인하고 응답합니다.
     */
    @PostMapping("/idCheck")
    public ResponseEntity<?> idCheck(
            @Validated @RequestBody UserDto userDto, // 요청 본문에서 EmailRequestDto를 받습니다.
            BindingResult bindingResult) { // 유효성 검사 결과를 받습니다.

        // 유효성 검사 실패 시
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            // 400 Bad Request와 함께 유효성 검사 실패 메시지를 반환합니다.
            return ResponseEntity.badRequest().body(errors);
        }

        String email = userDto.getEmail();
        boolean isDuplicated = userService.isEmailDuplicated(email);

        if (isDuplicated) {
            return ResponseEntity.ok("duplicate"); // 중복된 이메일
        } else {
            return ResponseEntity.ok("available"); // 사용 가능한 이메일
        }
    }

    /**
     * 사용자 등록(회원가입) API
     * 클라이언트에서 UserDto 정보를 JSON 본문으로 POST 요청합니다.
     * 유효성 검사 후, 서비스 계층을 통해 사용자를 등록하고 결과를 응답합니다.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Validated @RequestBody UserDto userDto, // 요청 본문에서 UserDto를 받습니다.
            BindingResult bindingResult) { // 유효성 검사 결과를 받습니다.
    	System.out.println(userDto.getPassword());
    	
    	System.out.println(userDto.toString());
        // 유효성 검사 실패 시
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        // 비밀번호가 null이 아닌지 확인 (UserDto에 @NotBlank가 있어도 추가 확인)
        if (userDto.getPassword() == null || userDto.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("비밀번호는 비워둘 수 없습니다.");
        }

        // 기본 역할 설정 (예: "ROLE_USER")
        if (userDto.getUsertype() == null || userDto.getUsertype().isEmpty()) {
            userDto.setUsertype("USER");
        }

        boolean isRegistered = userService.registerUser(userDto);

        if (isRegistered) {
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
        } else {
            // 등록 실패 (예: 이메일 중복으로 인한 실패)
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists or registration failed.");
        }
    }
	
}
