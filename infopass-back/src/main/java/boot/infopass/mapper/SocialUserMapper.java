package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.RequestParam;

import boot.infopass.dto.SocialUserDto;

@Mapper
public interface SocialUserMapper {
	public SocialUserDto findByProviderAndKey(@RequestParam("provider") String provider, @RequestParam("providerKey") String providerKey);
    public void insertSocialUser(SocialUserDto socialUser);
}
