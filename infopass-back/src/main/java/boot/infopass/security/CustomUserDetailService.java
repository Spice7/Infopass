package boot.infopass.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;


@Service
public class CustomUserDetailService implements UserDetailsService {

	@Autowired
	UserMapper userMapper;
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		// 이메일을 통해 실제 사용자 상세 정보를 조회합니다.
		UserDto userData = userMapper.findByEmail(email);

		if(userData != null) {
			System.out.println(email + " 아이디가 DB에 존재함!!");
			return new CustomUserDetail(userData);
		} else {
			System.out.println(email + " 아이디가 DB에 존재하지 않음!!");
			throw new UsernameNotFoundException(email + "을(를) 찾을 수 없습니다.");
		}
	}

}
