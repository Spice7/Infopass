package boot.infopass.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import boot.infopass.dto.UserDto;
import boot.infopass.security.contants.SecurityConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    // 🚨 authenticationManager 필드는 부모 클래스에 이미 존재하므로 여기서는 제거하거나,
    //    super() 생성자를 통해 전달하는 것이 올바른 방법입니다.
    // private final AuthenticationManager authenticationManager; 
    private final JwtTokenProvider jwtTokenProvider;

    // 생성자
    public JwtAuthenticationFilter( AuthenticationManager authenticationManager,  JwtTokenProvider jwtTokenProvider ) {
        // 🟢 부모 클래스의 생성자를 호출하여 AuthenticationManager를 전달합니다.
        super(authenticationManager); 
        // this.authenticationManager = authenticationManager; // 🚨 이 줄은 이제 필요 없습니다.
        this.jwtTokenProvider = jwtTokenProvider;
        // 🔗 필터 URL 경로 설정 : /login
        setFilterProcessesUrl(SecurityConstants.AUTH_LOGIN_URL);
    }
    
    /**
     * 🔐 인증 시도 메소드
     * : /login 경로로 (username, password) 를 요청하면 이 필터에서 걸려 인증을 시도합니다.
     * ✅ Authentication 인증 시도한 사용자 인증 객체를 반환하여, 시큐리티가 인증 성공 여부를 판단하게 합니다.
     * @param request
     * @param response
     * @return
     * @throws AuthenticationException
     */    
    // 🟢 메서드 이름을 attemptAuthentication으로 수정하고 @Override를 붙입니다.
    @Override 
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        
        String username = null;
        String password = null;
        
        try {
            // 요청 정보 로깅
            log.info("Content-Type: {}", request.getContentType());
            log.info("Content-Length: {}", request.getContentLength());
            
            // JSON 요청 처리
            if (request.getContentType() != null && request.getContentType().contains("application/json")) {
                log.info("JSON 요청으로 인식됨");
                ObjectMapper objectMapper = new ObjectMapper();
                UserDto loginRequest = objectMapper.readValue(request.getInputStream(), UserDto.class);
                username = loginRequest.getEmail();
                password = loginRequest.getPassword();
                log.info("JSON에서 파싱된 email: {}", username);
                log.info("JSON에서 파싱된 password 길이: {}", password != null ? password.length() : 0);
            } else {
                // 폼 데이터 처리 (기존 방식)
                log.info("폼 데이터 요청으로 인식됨");
                username = obtainUsername(request);
                password = obtainPassword(request);
            }
        } catch (IOException e) {
            log.error("JSON 파싱 실패: {}", e.getMessage());
            throw new AuthenticationException("Failed to parse login request") {};
        }

        if (username == null) {
            username = "";
        }
        if (password == null) {
            password = "";
        }
        username = username.trim();

        log.info("username : " + username);
        log.info("password : " + password);

        // 사용자 인증정보 객체 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        
        // 요청 정보 설정
        setDetails(request, authenticationToken);

        // 인증 시도
        return this.getAuthenticationManager().authenticate(authenticationToken);
    }


    /**
     * ⭕ 인증 성공 메소드
     * : attemptAuthentication() 호출 후, 반환된 Authentication - 사용자 인증 객체가 인증된 것이 확인되면, 호출됩니다.
     * * ➡ 🔐 JWT
     * : 로그인 인증에 성공했으므로, JWT 토큰을 생성하여 
     * 응답(response) 헤더에 jwt 토큰을 담아 응답합니다.
     * 💍 { Authorization : Bearer + {jwt} } 
     * @param request
     * @param response
     * @param chain
     * @param authentication
     * @throws IOException
     * @throws ServletException
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authentication) throws IOException , ServletException {
        log.info("인증 성공 (auth SUCCESS) : ");

        // CustomUser 캐스팅이 안전한지 확인 (CustomUserDetailsService에서 CustomUser를 반환해야 함)
        CustomUser user = (CustomUser) authentication.getPrincipal();
        int id = user.getUserDto().getId();
        String email = user.getUserDto().getEmail();

        List<String> roles = user.getAuthorities()
                                .stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

        // 🔐 JWT
        String token = jwtTokenProvider.createToken(id, email, roles);

        // 💍 { Authorization : Bearer + {jwt} } 
        response.addHeader(SecurityConstants.TOKEN_HEADER, SecurityConstants.TOKEN_PREFIX + token);
        response.setStatus(200);

        // 🟢 인증 성공 후 필터 체인을 계속 진행하지 않도록 합니다.
        //    로그인 필터는 응답을 완료하고 더 이상 필터 체인을 진행하지 않는 것이 일반적입니다.
        //    chain.doFilter(request, response); // 이 줄은 제거합니다.
    }

    // 🚨 인증 실패 시 처리 메서드
    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException, ServletException {
        log.info("인증 실패 (auth FAILED) : {}", failed.getMessage());
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Authentication failed\",\"message\":\"" + failed.getMessage() + "\"}");
    }
}