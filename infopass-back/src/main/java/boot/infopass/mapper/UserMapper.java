package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.UserDto;

@Mapper
public interface UserMapper {
	public UserDto findByEmail(String email);	
	public boolean existsByEmail(String email);
	public void insertUser(UserDto userDto);
}
