package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("Multiplayer")
public class MultiplayerDto {
	
	private Integer id;
	private Integer user_id;
	private Integer game_score;
	private Integer score;
	private Integer best_score;
	private Float average_score;
	private Timestamp updated_at;
}
