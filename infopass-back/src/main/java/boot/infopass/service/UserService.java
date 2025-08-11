package boot.infopass.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService implements UserServiceInter {

	@Autowired
	private UserMapper userMapper;

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	@Override
	public int insertUser(UserDto userDto) {
		// 비밀번호 암호화
		String password = userDto.getPassword();
		String encodedPw = bCryptPasswordEncoder.encode(password);
		userDto.setPassword(encodedPw);
		
		// 기본 권한 설정 (DB 저장 전에 설정)
		userDto.setUsertype("USER"); // 기본 권한 : 사용자 권한 (ROLE_USER)
		
		// 회원 등록
		int result = userMapper.insertUser(userDto);
		
		return result;
	}

	@Override
	public UserDto getUserData(Integer id) {

		return userMapper.getUserData(id);
	}

	

	@Override
	public boolean findById(String email) {
		// TODO Auto-generated method stub
		
		return userMapper.findById(email);
	}
	
	
	
	
	
	

	@Override
    public UserDto updateUser(Long id, UserDto updatedUserDto) {
        updatedUserDto.setId(id.intValue());
        int result = userMapper.updateUser(updatedUserDto);  // UserMapper 메서드 호출
        if (result > 0) {
            return userMapper.getUserData(updatedUserDto.getId());
        } else {
            return null;
        }
    }

	


}
