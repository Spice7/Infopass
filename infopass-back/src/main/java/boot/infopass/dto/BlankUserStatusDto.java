package boot.infopass.dto;

import org.apache.ibatis.type.Alias;


import lombok.Data;
@Data
@Alias("BlankUserStatusDto")
public class BlankUserStatusDto {
    private Long user_id;
    private Integer user_score;
    private Double remain_time;
}
