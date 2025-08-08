package boot.infopass.controller;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin( origins = "http://localhost:5173")
public class AdminController {
	
	@GetMapping("/admin")
	public String main() {
		return "admin";
	}
	@GetMapping("/access-denied")
	public String accessError()
	{
		return "access-denied";
	}
}
