package boot.infopass.service;
import boot.infopass.dto.UserDto;

public interface UserServiceInter {
	public int insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public boolean findById(String email);

	public UserDto updateUser(Long id, UserDto updatedUserDto);
	public boolean findByNickName(String nickname);
}
