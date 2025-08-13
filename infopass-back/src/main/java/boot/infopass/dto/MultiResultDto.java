package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("multiresult")
public class MultiResultDto {
	
	private Integer id;
	private Integer lobbyId;
	private Integer userId;
	private Integer score;
	private Integer userRank;
	private Integer userRankPoint;
	private String gameType;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp createdAt;
}