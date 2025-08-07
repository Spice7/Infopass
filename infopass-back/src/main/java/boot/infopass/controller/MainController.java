package boot.infopass.controller;

import java.util.Collection;
import java.util.Iterator;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import ch.qos.logback.core.model.Model;

@RestController
@CrossOrigin( origins = "http://localhost:5173")
public class MainController {

	@GetMapping("/")
	public String mainPage(Model model)
	{
		//세션현재사용자 아이디
		String id=SecurityContextHolder.getContext().getAuthentication().getName();
		
		//세션현재사용자 롤
		Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
		
		Collection<? extends GrantedAuthority> authortites=authentication.getAuthorities();
		Iterator<? extends GrantedAuthority> iter=authortites.iterator();
		
		GrantedAuthority auth=iter.next();
		
		String role=auth.getAuthority();
		System.out.println("id="+id);
		System.out.println("role="+role);		
		
		return "main";
	}
}

