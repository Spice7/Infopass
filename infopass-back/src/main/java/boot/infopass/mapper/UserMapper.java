package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.UserDto;

@Mapper
public interface UserMapper {
	public int insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public UserDto login(String email);
	public boolean findById(String email);
}
