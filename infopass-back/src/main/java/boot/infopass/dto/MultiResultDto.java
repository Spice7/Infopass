package boot.infopass.dto;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("multiresult")
public class MultiResultDto {
	
	private Integer id;
	private Integer lobby_id;
	private Integer user_id;
	private Integer score;
	private Integer user_rank;
}