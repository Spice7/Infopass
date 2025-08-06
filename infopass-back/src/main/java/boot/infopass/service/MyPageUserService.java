package boot.infopass.service;

import org.springframework.stereotype.Service;
import boot.infopass.dto.MyPageUserDto;
import boot.infopass.mapper.MyPageUserMapperInter;

@Service
public class MyPageUserService {
    private final MyPageUserMapperInter myPageUserMapper;

    public MyPageUserService(MyPageUserMapperInter myPageUserMapper) {
        this.myPageUserMapper = myPageUserMapper;
    }

    public MyPageUserDto getUserById(int id) {
        return myPageUserMapper.findUserById(id);
    }
}
