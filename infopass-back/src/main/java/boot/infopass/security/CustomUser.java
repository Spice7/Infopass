package boot.infopass.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import boot.infopass.dto.UserDto;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class CustomUser implements UserDetails {

    private UserDto userDto;         

    public CustomUser(UserDto userDto) {
        this.userDto = userDto;
    }

    /**
     * 🟢🟡🔴 권한 getter 메소드
     * ✅ UserDetails 를 CustomUser 로 구현하여, 
     *     Spring Security 의 User 대신 사용자 정의 인증 객체(CustomUser)를 사용한다면,
     *     권한은 'ROLE_' 붙여서 사용해야한다.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
    	 // 권한을 담을 리스트를 생성합니다.
        List<GrantedAuthority> authorities = new ArrayList();
        
        // userDto에서 usertype 문자열을 가져와 "ROLE_" 접두사를 붙여 GrantedAuthority 객체로 만듭니다.
        authorities.add(new SimpleGrantedAuthority("ROLE_" + userDto.getUsertype()));
        
        return authorities;
    }

    @Override
    public String getPassword() {
        return userDto.getPassword();
    }

    @Override
    public String getUsername() {
        return userDto.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return userDto.getEnabled() == 0 ? false : true;
    }



    
}