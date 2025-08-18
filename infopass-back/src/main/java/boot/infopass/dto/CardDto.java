package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;
@Data
@Alias("card")
public class CardDto {
    private Integer id;
    private String question;
    private String answer;
    private Timestamp created_at;
    
}
