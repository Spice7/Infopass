package boot.infopass.security;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

        // 폼 기반 로그인 비활성화
        http.formLogin(login -> login.disable());

        // HTTP 기본 인증 비활성화
        http.httpBasic(basic -> basic.disable());

        // CSRF(Cross-Site Request Forgery) 공격 방어 기능 비활성화
        http.csrf(csrf -> csrf.disable());

        // CORS 설정
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 필터 설정
        // ✅ JWT 요청 필터 1️⃣
        // ✅ JWT 인증 필터 2️⃣

        // 🟢 인가 설정 (authorizeHttpRequests)
        http.addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtRequestFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        // 사용자 정보를 불러오는 서비스 설정
        http.userDetailsService(customUserDetailService);

        // JWT 요청 필터 1️
        // JWT 인증 필터 2️
        http.addFilterAt(new JwtAuthenticationFilter(authenticationManager, jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtRequestFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        // 인가 설정 (authorizeHttpRequests)
        http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // ✅ 1. 공개적으로 허용할 정적 리소스 및 경로를 먼저 지정합니다.
                .requestMatchers("/", "/login", "/user/**", "/oxquiz/**", "/ws/**", "/ws*", "/block/**", "/rank/**",
                        "/lobby/**", "/blankgamesingle/**")
                .permitAll()

                // 2. 특정 권한이 필요한 경로를 지정합니다.
                .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ✅ 3. 위의 규칙에 해당하지 않는 모든 요청은 인증이 필요합니다.
                .anyRequest().authenticated());

        // 사용자 정보를 불러오는 서비스 설정
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

        // 허용할 오리진 설정
        configuration.addAllowedOrigin("http://localhost:5173");

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

}
