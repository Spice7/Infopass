package boot.infopass.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.RequestBody;

import boot.infopass.dto.SocialUserDto;

@Mapper
public interface SocialUserMapper {
	public SocialUserDto findByProviderAndKey(@RequestBody Map<String, String> params);
    public void insertSocialUser(SocialUserDto socialUser);
}
