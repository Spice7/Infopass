package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("oxstatus")
public class OXQuizStatusDto {

	private Integer id;
	private Integer user_id;
	private Integer user_score;
	private Float remain_time;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp created_at;
}
