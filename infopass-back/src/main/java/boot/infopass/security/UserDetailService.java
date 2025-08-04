package boot.infopass.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;

public class UserDetailService implements UserDetailsService {
	
	@Autowired
	UserMapper userMapper;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		
		UserDto userData=userMapper.findByUsername(username);
		
		if(userData!=null)
		{
			System.out.println(username+" 아이디가 DB에 존재함!!");
			return new UserDetail(userData);
		}else {
			System.out.println(username+" 아이디가 DB에 존재하지 않음!!");
			throw new UsernameNotFoundException(username);
		}
	
	}

}
