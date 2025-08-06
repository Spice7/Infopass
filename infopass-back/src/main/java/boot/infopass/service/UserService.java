package boot.infopass.service;



import org.springframework.beans.factory.annotation.Autowired;
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
	public void login(UserDto userDto, HttpServletRequest request) {
		// JWT 인증 필터에서 인증을 처리하므로 여기서는 로그만 남김
		System.out.println("로그인 시도: " + userDto.getEmail());
		// 실제 인증은 JwtAuthenticationFilter에서 수행됨
	}

	@Override
	public boolean findById(String email) {
		// TODO Auto-generated method stub
		return userMapper.findById(email);
	}

}
