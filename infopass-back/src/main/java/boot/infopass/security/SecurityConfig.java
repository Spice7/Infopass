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
        log.info("로그인 경로 /login 접근 허용 설정 중...");

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

        // 권한 설정 - 간소화된 버전
        http.authorizeHttpRequests(authorize -> authorize
                // 🔐 가장 중요: 로그인 경로 최우선 허용
                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/login").permitAll()
                
                // 🌐 전체 허용 경로들
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/actuator/**").permitAll()
                
                // 🎮 게임 관련 전체 허용
                .requestMatchers("/api/**", "/lobby/**", "/oxquiz/**", "/rank/**", "/block/**", 
                        "/blankgamesingle/**", "/card/**", "/inquiries/**", "/api/games/**", "/api/quiz/**",
                        "/wrong-answers/**", "/results/**")
                .permitAll()
                
                // 👤 사용자 관련 허용 (회원가입, 찾기 등)
                .requestMatchers("/user/checkId", "/user/checkNickName", "/user/join", 
                        "/user/sendSms", "/user/verifyCode", "/user/findPw", "/user/findId",
                        "/user/social/**", "/user/getResearchEmail", "/user/findPwCheck", "/user/changePw",
                        "/auth/callback/**")
                .permitAll()
                
                // 🎨 정적 리소스
                .requestMatchers("/css/**", "/js/**", "/images/**", "/ox_image/**", "/public/**")
                .permitAll()
                
                // 🔗 웹소켓 관련
                .requestMatchers("/ws/**", "/ws-game/**", "/topic/**", "/queue/**", "/app/**")
                .permitAll()

                // 🔒 인증 필요 경로
                .requestMatchers("/user/info", "/user/update/**", "/user/remove/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // 🚫 나머지 모든 요청은 인증 필요
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