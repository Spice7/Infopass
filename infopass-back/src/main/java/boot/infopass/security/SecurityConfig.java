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

        http.authorizeHttpRequests(authorize -> authorize
                // ✅ 1. 웹소켓 경로는 모든 보안 규칙에서 제외 (가장 중요!)
                .requestMatchers("/ws-game/**").permitAll() // websocket

                // ✅ 2. 인증 없이 접근을 허용할 경로들
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/api/rooms", "/api/rooms/player/search/**", "/login", "/user/**", "/admin/**",
                        "/wrong-answers/**", "/results/**", "/rank/**", "/actuator/**")
                .permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/ox_image/**",
                        "/api/rooms/player/**", "/api/ranking/**", "/public/**")
                .permitAll()
                .requestMatchers("/lobby/**", "/oxquiz/**", "/rank/**", "/block/**", "/blankgamesingle/**", "/card/**",
                        "/api/rooms/**", "/api/**", "/inquiries/**", "/api/games/**", "/api/quiz/**")
                .permitAll() // 게임 관련 API 허용

                // ✅ 3. 특정 권한이 필요한 경로
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ✅ 4. 위 규칙에 해당하지 않는 모든 요청은 인증 필요
                .anyRequest().authenticated());

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

        // 허용할 오리진 설정 - 환경별로 설정
        String profile = System.getProperty("spring.profiles.active", "local");
        if ("prod".equals(profile)) {
            // 배포 환경 - Docker 내부 통신
            configuration.addAllowedOrigin("http://localhost");  // Docker nginx
            configuration.addAllowedOrigin("http://localhost:80");
            configuration.addAllowedOrigin("https://localhost");  // HTTPS 지원 추가
            configuration.addAllowedOrigin("https://localhost:443");  // HTTPS 포트 지원 추가
            
            // EC2 Public IP 설정 (환경변수로 설정 가능하도록)
            String ec2PublicIp = System.getenv("EC2_PUBLIC_IP");
            if (ec2PublicIp != null && !ec2PublicIp.isEmpty()) {
                configuration.addAllowedOrigin("http://" + ec2PublicIp);
                configuration.addAllowedOrigin("http://" + ec2PublicIp + ":80");
                configuration.addAllowedOrigin("https://" + ec2PublicIp);  // HTTPS 지원 추가
                configuration.addAllowedOrigin("https://" + ec2PublicIp + ":443");  // HTTPS 포트 지원 추가
            }
            
            // 커스텀 도메인 (환경변수로 설정)
            String customDomain = System.getenv("CUSTOM_DOMAIN");
            if (customDomain != null && !customDomain.isEmpty()) {
                configuration.addAllowedOrigin("http://" + customDomain);
                configuration.addAllowedOrigin("http://" + customDomain + ":9000");
                configuration.addAllowedOrigin("https://" + customDomain);
                configuration.addAllowedOrigin("https://" + customDomain + ":9000");
            }
            
            // 프론트엔드 URL 환경변수 사용
            String frontendUrl = System.getenv("VITE_FRONTEND_URL");
            if (frontendUrl != null && !frontendUrl.isEmpty()) {
                configuration.addAllowedOrigin(frontendUrl);
                // HTTP/HTTPS 모두 지원
                if (frontendUrl.startsWith("https://")) {
                    configuration.addAllowedOrigin(frontendUrl.replace("https://", "http://"));
                } else if (frontendUrl.startsWith("http://")) {
                    configuration.addAllowedOrigin(frontendUrl.replace("http://", "https://"));
                }
            }
            
            // 개발/테스트용 - 실제 배포시 제거 권장
            configuration.addAllowedOriginPattern("*"); // 임시 허용
        } else {
            // 개발 환경 설정
            configuration.addAllowedOrigin("http://localhost:5173");
            configuration.addAllowedOrigin("http://192.168.10.141:5173");
        }
        
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