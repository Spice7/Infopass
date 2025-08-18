package boot.infopass.service;

import java.util.Map;


import boot.infopass.dto.UserDto;
import jakarta.servlet.http.HttpSession;

public interface UserServiceInter {
	public UserDto insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public boolean findById(String email);	
	public UserDto updateUser(Long id, UserDto updatedUserDto);
	public boolean findByNickName(String nickname);
	public Map<String, String> sendSms(String phone);
	public Map<String, String> verifyCode(String phone, String sendCode, HttpSession session);
	public UserDto findByPhone(String phone);
	public String getResearchEmail(UserDto userDto);
	public boolean findPwCheck(UserDto userDto);
	public void changePw(UserDto userDto);
	public UserDto getById(UserDto userDto);
}
