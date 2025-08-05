package boot.infopass.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import boot.infopass.dto.UserDto;



public class CustomUserDetail implements UserDetails {

	
 	private UserDto userDto;
 	
 	public CustomUserDetail(UserDto userDto) {
        this.userDto = userDto;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        // UserDto의 role 필드를 기반으로 권한을 추가합니다.
        // 예: userDto.getRole()이 "ROLE_USER" 또는 "ROLE_ADMIN"과 같은 형식이어야 합니다.
        authorities.add(new SimpleGrantedAuthority(userDto.getUsertype()));
        return authorities;
    }

    @Override
    public String getPassword() {
        return userDto.getPassword(); // 암호화된 비밀번호 반환
    }

    @Override
    public String getUsername() {
        return userDto.getEmail(); // Spring Security의 "username"으로 이메일을 사용
    }

    // 계정 만료 여부 (true = 만료되지 않음)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정 잠금 여부 (true = 잠금되지 않음)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 자격 증명(비밀번호) 만료 여부 (true = 만료되지 않음)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 계정 활성화 여부 (true = 활성화됨)
    @Override
    public boolean isEnabled() {
        return true;
    }

    // 필요 시 UserDto 객체를 직접 가져올 수 있는 메서드
    public UserDto getUserDto() {
        return userDto;
    }
}
