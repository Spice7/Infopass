package boot.infopass.dto;

import org.apache.ibatis.type.Alias;


import lombok.Data;
@Data
@Alias("BlankSubmissionDto")
public class BlankSubmissionDto {

	private Long user_id;
	private Long quiz_id;
	private String submitted_answer;
    private Boolean is_correct;
}
