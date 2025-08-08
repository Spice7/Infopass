package boot.infopass.service;

import boot.infopass.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;


public interface UserServiceInter {
	public int insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public void login(UserDto userDto, HttpServletRequest requset);
	public boolean findById(String email);
}
