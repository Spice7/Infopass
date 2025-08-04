package boot.infopass.security;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler{
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		// TODO Auto-generated method stub

		HttpSession session=request.getSession();
		//세션 현재사용자 아이디와 권한얻기
		String id=authentication.getName();
		Collection<? extends GrantedAuthority> authorites=authentication.getAuthorities();
		Iterator<? extends GrantedAuthority> iter=authorites.iterator();
		GrantedAuthority auth=iter.next();
		
		String role=auth.getAuthority();
		
		session.setAttribute("id", id);
		session.setAttribute("role", role);
		response.sendRedirect("/my/mypage"); //로그인 성공시 이동할 페이지
	}
	
}
