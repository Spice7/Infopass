package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("oxsub")
public class OXQuizSubDto {

	private Integer id;
	private Integer user_id;
	private Integer question_id;
	private String submitted_answer;
	private Integer is_correct;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp created_at;
}
