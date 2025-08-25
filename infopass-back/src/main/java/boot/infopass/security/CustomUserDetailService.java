package boot.infopass.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info(":::::::::: UserDetailServiceImpl ::::::::::");
        log.info("- 사용자 정의 인증을 위해, 사용자 정보 조회");
        log.info("- username : " + username);

        UserDto userDto = null;
        try {
            // 👩‍💼 사용자 정보 및 권한 조회
        	userDto = userMapper.login(username);
        	log.info("DB에서 조회된 사용자 정보: {}", userDto);
            System.out.println("DB에서 조회된 사용자 정보: " + userDto);
        } catch (Exception e) {
            log.error("사용자 조회 중 오류 발생: {}", e.getMessage());
            e.printStackTrace();
        }
        if( userDto == null ) {
            log.error("사용자를 찾을 수 없습니다: {}", username);
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다." + username);
        }
        
        log.info("사용자 enabled 상태: {}", userDto.getEnabled());
        log.info("사용자 usertype: {}", userDto.getUsertype());

        // 🔐 CustomUser ➡ UserDetails
        CustomUser customUser = new CustomUser(userDto);
        return customUser;
    }
}