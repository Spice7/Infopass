package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.UserDto;

@Mapper
public interface UserMapper {
	UserDto findByUsername(String username);
	boolean existsByUsername(String username);
}
