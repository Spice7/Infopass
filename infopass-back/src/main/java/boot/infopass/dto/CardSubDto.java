package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("cardSub")
public class CardSubDto {
    private Integer id;
    private Integer user_id;
    private Integer question_id;
    private String session_id;
    private String submitted_answer;
    
	// is_correct 필드를 boolean으로 변경 (NOT NULL 제약 조건)
	@JsonProperty("is_correct")
	private boolean is_correct;
	
    private Timestamp created_at;
    
	// 수동으로 getter/setter 정의
	public boolean getIs_correct() { return is_correct; }
	public void setIs_correct(boolean is_correct) { this.is_correct = is_correct; }
}
