package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("oxquizAdmin")
public class OXQuizAdminDto {
    private Integer id;
    private String question;
    private Integer answer; // 0=X, 1=O
    private String quiz_explanition; // 테이블 컬럼명에 맞춰서 오타 유지
    private String category;
    private Timestamp created_at;
}
