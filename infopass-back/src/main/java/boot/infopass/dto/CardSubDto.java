package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("cardSub")
public class CardSubDto {
    private Integer id;
    private Integer user_id;
    private Integer question_id;
    private String submitted_answer;
    private Integer is_correct;
    private Timestamp created_at;
}
