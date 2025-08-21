package boot.infopass.mapper;
import java.util.List;


import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.dto.UserDto;

@Mapper
public interface UserMapper {
	List<RankedUserDto> findUsersByIds(List<Long> userIds);
	public int insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public UserDto login(String email);
	public boolean findById(String email);	   
	public int updateUser(UserDto userDto);
	public boolean findByNickName(String nickname);
	public UserDto findByPhone(String phone);
	public UserDto findById(Integer id);
	public UserDto findByEmail(String email);

	public void updateUserExp(UserDto dto);
	
	public String getResearchEmail(UserDto userDto);
	public boolean findPwCheck(UserDto userDto);
	public void changePw(UserDto userDto);
	public UserDto getById(UserDto userDto);
	public void updateUserExpAndLevel(UserDto user);
	UserDto getUserById(int userId);
}
