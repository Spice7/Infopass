package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("oxsub")
public class OXQuizSubDto {

	private int id;
	private int user_id;
	private int question_id;
	private String submitted_answer;
	private int is_correct;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private Timestamp created_at;
}
