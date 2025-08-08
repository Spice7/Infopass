package boot.infopass.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.infopass.dto.UserDto;

@Mapper
public interface MyPageUserMapperInter {
    UserDto findUserById(@Param("id") int id);
}
