package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.dto.UserDto;

@Mapper
public interface UserMapper {
	List<RankedUserDto> findUserByIds(List<Long> userIds);
	public int insertUser(UserDto userDto);
	public UserDto getUserData(Integer id);
	public UserDto login(String email);
	public boolean findById(String email);
}
