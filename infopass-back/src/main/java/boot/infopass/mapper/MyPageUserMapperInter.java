package boot.infopass.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.infopass.dto.MyPageUserDto;

@Mapper
public interface MyPageUserMapperInter {
    MyPageUserDto findUserById(@Param("id") int id);
}
