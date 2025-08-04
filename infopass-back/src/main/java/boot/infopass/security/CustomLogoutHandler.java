package boot.infopass.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class CustomLogoutHandler implements LogoutHandler {

	@Override
	public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
		// TODO Auto-generated method stub
		HttpSession session=request.getSession(false);
		if(session!=null)
		{
			session.removeAttribute("id");
			session.removeAttribute("role");
			System.out.println("세션 삭제!!");
		}
		
		
	}

}