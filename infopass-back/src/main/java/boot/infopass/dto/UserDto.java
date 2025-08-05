package boot.infopass.dto;

import java.sql.Timestamp;
import java.util.List;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("user")
public class UserDto {
	private Integer id;
	private String password;
	private String name;
	private String nickname;
	private String email;
	private String phone;
	private String address;
	private String usertype;
	private Integer exp;
	private Integer level;
	private Timestamp rank_updated_at;
	private Timestamp created_at;

	// 권한 목록
    List<UserAuth> authList;
    
    public UserDto(UserDto userDto) {
    	this.id=userDto.id;
    	this.password=userDto.password;
    	this.name=userDto.name;
    	this.nickname=userDto.nickname;
    	this.email=userDto.email;
    	this.phone=userDto.phone;
    	this.address=userDto.address;
    	this.authList = userDto.getAuthList();
    }
}

