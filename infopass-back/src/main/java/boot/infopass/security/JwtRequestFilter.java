package boot.infopass.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import boot.infopass.security.contants.SecurityConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    // 생성자
    public JwtRequestFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {


        try {
            String path = request.getRequestURI();
            String method = request.getMethod();

            log.info("JwtRequestFilter URI: " + path + ", Method: " + method);

            // OPTIONS 요청이나 /rank 경로는 필터 통과
            if ("OPTIONS".equals(method) || path.startsWith("/rank")) {
                log.info("Skipping JWT check for " + method + " " + path);
                filterChain.doFilter(request, response);
                return;
            }

            // HTTP 헤더에서 토큰을 가져옴
            String header = request.getHeader(SecurityConstants.TOKEN_HEADER);
            log.info("authorization : " + header);

            // ✅ Bearer + {jwt} 체크
            // 헤더가 없거나 형식이 올바르지 않으면 다음 필터로 진행
            if (header == null || header.length() == 0 || !header.startsWith(SecurityConstants.TOKEN_PREFIX)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 🔐 JWT
            // Bearer + ${jwt} ➡ "Bearer " 제거
            String jwt = header.replace(SecurityConstants.TOKEN_PREFIX, "");

            // 토큰을 사용하여 Authentication 객체 생성
            Authentication authentication = jwtTokenProvider.getAuthentication(jwt);

            // 토큰 유효 검사 (토큰이 만료되지 않았으면)
            if (jwtTokenProvider.validateToken(jwt)) {
                log.info("유효한 JWT 토큰입니다.");
                // 👩‍💼 [로그인]
                // SecurityContextHolder(사용자 보안정보를 담는 객체)에
                // Authentication(사용자 인증 정보) 객체를 설정
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            // 다음 필터로 진행
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 예외 발생 시 로그 출력
            log.error("Error in JWT filter: " + e.getMessage(), e);
            // 클라이언트에게 401 Unauthorized 에러 응답
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
        }
    }
}
