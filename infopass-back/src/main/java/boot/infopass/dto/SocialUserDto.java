package boot.infopass.dto;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("socialUser")
public class SocialUserDto {

    private int id;
    private int user_id;
    private String provider;
    private String provider_key;
}
