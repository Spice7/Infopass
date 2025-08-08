package boot.infopass.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;

@Service
public class UserService {

	@Autowired
	private UserMapper userMapper;
	
	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;
	
	 /**
     * 이메일 중복 여부를 확인합니다.
     * email 확인할 이메일 주소
     * 이메일이 이미 존재하면 true, 존재하지 않으면 false
     */
    public boolean isEmailDuplicated(String email) {
        return userMapper.existsByEmail(email);
    }

    /**
     * 새로운 사용자를 등록합니다.
     * userDto 등록할 사용자 정보 (비밀번호는 암호화되지 않은 상태)
     * 사용자 등록 성공 시 true, 실패 시 (예: 이미 존재하는 이메일) false
     */
    public boolean registerUser(UserDto userDto) {
        // 등록 전 이메일 중복 확인 (Race Condition 방지 및 클라이언트 측 유효성 검사 보완)
        if (isEmailDuplicated(userDto.getEmail())) {
            System.out.println(userDto.getEmail() + "님은 이미 존재하여 등록할 수 없습니다.");
            return false; // 이미 존재하는 이메일이므로 등록 실패
        }

        System.out.println(userDto.getEmail() + "님 DB저장 시작!!");
        
        // 비밀번호를 암호화합니다.
        String encryptedPassword = bCryptPasswordEncoder.encode(userDto.getPassword());
        userDto.setPassword(encryptedPassword);

        // 사용자 정보를 데이터베이스에 저장합니다.
        try {
            userMapper.insertUser(userDto);
            System.out.println(userDto.getEmail() + "님 DB저장 완료!!");
            return true; // 등록 성공
        } catch (Exception e) {
            System.err.println("사용자 등록 중 오류 발생: " + e.getMessage());
            // 실제 애플리케이션에서는 더 구체적인 예외 처리 또는 로깅이 필요합니다.
            return false; // 등록 실패
        }
    }
    
    public UserDto Finduser(String email) {
    	return userMapper.findByEmail(email);
    }
   
	
}
