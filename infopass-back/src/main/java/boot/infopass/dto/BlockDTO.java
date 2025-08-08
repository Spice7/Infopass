package boot.infopass.dto;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("block")
public class BlockDTO {
	private int id;
	private String question;
	private String question_blocks;
	private String answer;
	private String toolbox;
	private String category;
	private String created_at;
}
