package boot.infopass.dto;

import java.sql.Timestamp;


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
	private Integer enabled;
}

