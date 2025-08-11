package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("lobby")
public class LobbyDto {

	private Integer id;
	private Integer host_user_id;
	private String game_type;
	private String status;
	private Integer max_players;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp created_at;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp ended_at;
	
}
