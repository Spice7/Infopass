package boot.infopass.dto;

import java.sql.Timestamp;
import org.apache.ibatis.type.Alias;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
@Alias("wrong")
public class WrongAnswerDto {

    private Integer id;
    private Integer userId;
    private String gameType;
    private Integer questionId;
    private String submittedAnswer;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private Timestamp createdAt;

    private String question;       // 추가
    private String correctAnswer;  // 추가
}
