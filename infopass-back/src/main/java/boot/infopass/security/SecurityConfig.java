package boot.infopass.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {
	
	@Bean //암호화에 대한 빈 추가
	public BCryptPasswordEncoder bCryptPasswordEncoder() {
		
		return new BCryptPasswordEncoder();
	}
	
	
	
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http,
	        CustomLoginSuccessHandler loginSuccessHandler,
	        CustomLogoutHandler logoutHandler) throws Exception {

	    http
	        .cors(cors -> {}) // CORS 활성화
	        .authorizeHttpRequests(auth -> auth
	            .requestMatchers("/", "/login", "/user/**", "/oxquiz/**", "/ws/**", "/ws*").permitAll()
	            .requestMatchers("/admin").hasRole("ADMIN")
	            .anyRequest().hasAnyRole("ADMIN", "USER")
	        )
	        .formLogin(auth -> auth
	            .loginPage("/login")
	            .loginProcessingUrl("/loginProc")
	            .successHandler(loginSuccessHandler)
	            .permitAll()
	        )
	        .logout(logout -> logout
	            .logoutUrl("/logout")
	            .logoutSuccessUrl("/")
	            .addLogoutHandler(logoutHandler)
	        )
	        .csrf(csrf -> csrf.disable());

	    return http.build();
	}

   
// 🔧 CORS 설정을 따로 명시하는 Bean
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       registry.addMapping("/**") // 모든 경로에 대해
               .allowedOrigins("http://localhost:5173") // 허용할 origin
               .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
               .allowedHeaders("*") // 모든 헤더 허용
               .allowCredentials(true) // 자격 증명(쿠키, 인증 헤더) 허용 여부
               .maxAge(3600); // preflight 요청의 유효 시간 (초)
   }
   
}



