package boot.infopass.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class BlockSubDTO {
	private int id;
	private String session_id;
	private int user_id;
	private int question_id;
	private String submitted_answer;
	private boolean is_correct;
	private Timestamp created_at;
}
