package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("oxquiz")
public class OXQuizDto {

	private int id;
	private String question;
	private int answer;
	private String category;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp created_at;
}
