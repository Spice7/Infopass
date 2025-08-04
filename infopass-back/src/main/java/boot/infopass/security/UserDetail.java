package boot.infopass.security;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import boot.infopass.dto.UserDto;



public class UserDetail implements UserDetails {

	
 	private UserDto userDto;
 	
 	public UserDetail(UserDto userDto) {
		// TODO Auto-generated constructor stub
 		this.userDto=userDto;
	}
 	
 
 	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		
		Collection<GrantedAuthority> collection=new ArrayList<>();
		collection.add(new GrantedAuthority() {
			
			@Override
			public String getAuthority() {
				// TODO Auto-generated method stub
				return "";
			}
		});
		
		
		return collection;
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return "";
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return "";
	}
	
	@Override
	public boolean isEnabled() {
		// 사이트에서 1년간 로그인 안하면 휴면계정으로 전환
		return true;
	}
	
}
