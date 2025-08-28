package boot.infopass.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true) // 어노테이션에 prePostEnabled = true를 추가하면

// AuthenticationManager를 자동으로 구성합니다.
public class SecurityConfig {

    @Autowired
    private CustomUserDetailService customUserDetailService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager)
            throws Exception {
        log.info("securityFilterChain...");

        // 폼 기반 로그인 및 HTTP 기본 인증 비활성화
        http.formLogin(login -> login.disable());
        http.httpBasic(basic -> basic.disable());

        // CSRF 보호 비활성화
        http.csrf(csrf -> csrf.disable());

        // CORS 설정 적용
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 세션 정책을 STATELESS로 설정 (JWT 사용 시 필수)
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 필터 설정
        // ✅ JWT 요청 필터 1️⃣
        // ✅ JWT 인증 필터 2️⃣
        http.addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtRequestFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        // WebSocket 메시지 인증을 위한 추가 설정
        http.authorizeHttpRequests(authorize -> authorize
                // ✅ 0. 로그인 경로를 가장 먼저 허용 (우선순위 최상위)
                .requestMatchers("/login").permitAll() // 로그인 명시적 허용
                
                // ✅ 1. 웹소켓 경로는 모든 보안 규칙에서 제외 (가장 중요!)
                .requestMatchers("/ws/**").permitAll() // websocket
                .requestMatchers("/ws-game/**").permitAll() // websocket game
                .requestMatchers("/topic/**").permitAll() // websocket topic
                .requestMatchers("/queue/**").permitAll() // websocket queue
                .requestMatchers("/app/**").permitAll() // websocket app

                // ✅ 2. 인증 없이 접근을 허용할 경로들
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/api/rooms", "/api/rooms/player/search/**", 
                        "/wrong-answers/**", "/results/**", "/rank/**", "/actuator/**")
                .permitAll()
                // 사용자 관련 특정 경로만 허용 (회원가입, 아이디/비번 찾기 등)
                .requestMatchers("/user/checkId", "/user/checkNickName", "/user/join", 
                        "/user/sendSms", "/user/verifyCode", "/user/findPw", "/user/findId",
                        "/user/social/**", "/user/getResearchEmail", "/user/findPwCheck", "/user/changePw")
                .permitAll()
                // 소셜 로그인 콜백 경로 허용
                .requestMatchers("/auth/callback/**")
                .permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/ox_image/**",
                        "/api/rooms/player/**", "/api/ranking/**", "/public/**")
                .permitAll()
                .requestMatchers("/lobby/**", "/oxquiz/**", "/rank/**", "/block/**", "/blankgamesingle/**", "/card/**",
                        "/api/rooms/**", "/api/**", "/inquiries/**", "/api/games/**", "/api/quiz/**")
                .permitAll() // 게임 관련 API 허용

                // ✅ 3. 특정 권한이 필요한 경로
                .requestMatchers("/user/info", "/user/update/**", "/user/remove/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ✅ 4. 위 규칙에 해당하지 않는 모든 요청은 인증 필요
                .anyRequest().authenticated());

        // WebSocket 메시지에 대한 모든 보안 제한 해제
        http.csrf(csrf -> csrf.ignoringRequestMatchers("/ws/**", "/ws-game/**", "/topic/**", "/queue/**", "/app/**"));

        // 사용자 정보 서비스 설정
        http.userDetailsService(customUserDetailService);
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 환경변수에서 허용 오리진 가져오기
        String frontendUrl = System.getenv("VITE_FRONTEND_URL");
        String ec2PublicIp = System.getenv("EC2_PUBLIC_IP");
        String customDomain = System.getenv("CUSTOM_DOMAIN");
        
        // 기본 개발환경 오리진 허용
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedOrigin("http://localhost:80");
        configuration.addAllowedOrigin("http://localhost:3000");
        
        // 환경변수 기반 오리진 추가
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            configuration.addAllowedOrigin(frontendUrl);
        }
        if (ec2PublicIp != null && !ec2PublicIp.isEmpty()) {
            configuration.addAllowedOrigin("http://" + ec2PublicIp);
            configuration.addAllowedOrigin("http://" + ec2PublicIp + ":80");
            configuration.addAllowedOrigin("http://" + ec2PublicIp + ":9000");
        }
        if (customDomain != null && !customDomain.isEmpty()) {
            configuration.addAllowedOrigin("http://" + customDomain);
            configuration.addAllowedOrigin("http://" + customDomain + ":80");
        }
        
        // 모든 패턴 허용 (유연성을 위해 유지)
        configuration.addAllowedOriginPattern("*");
        
        // 허용할 헤더 설정
        configuration.addAllowedHeader("*");

        // 허용할 HTTP 메소드 설정
        configuration.addAllowedMethod("*");

        // 인증 정보 포함 허용
        configuration.setAllowCredentials(true);

        // Authorization 헤더 노출 허용
        configuration.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 인증 없이 허용할 경로를 여기에 추가
        return path.startsWith("/user/social/") ||
               path.startsWith("/user/checkId") ||
               path.startsWith("/user/checkNickName") ||
               path.startsWith("/user/join") ||
               path.startsWith("/user/sendSms") ||
               path.startsWith("/user/verifyCode") ||
               path.startsWith("/user/findPw") ||
               path.startsWith("/user/findId") ||
               path.startsWith("/rank/") ||
               path.startsWith("/actuator/");
    }
}