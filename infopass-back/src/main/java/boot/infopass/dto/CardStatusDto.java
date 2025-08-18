package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("cardStatus")
public class CardStatusDto {
    private Integer user_id;
    private Integer card_id;
    private Boolean is_correct;
    private Timestamp created_at;
}