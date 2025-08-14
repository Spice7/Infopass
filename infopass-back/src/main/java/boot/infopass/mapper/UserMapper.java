package boot.infopass.mapper;
import java.util.List;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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
	public String getResearchEmail(@Param("name") String name, @Param("phone") String phone);
	public boolean findPwCheck(@Param("email") String email, @Param("phone") String phone);
	public String changePw(@Param("email") String email, @Param("phone") String phone, @Param("newPw") String newPw);
}
