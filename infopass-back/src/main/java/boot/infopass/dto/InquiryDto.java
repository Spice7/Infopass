package boot.infopass.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("inquiry")
public class InquiryDto {
    private Integer id;
    private Integer user_id;
    private String title;
    private String category;
    private String content;
    private String status; // '접수','처리 중','답변 완료'
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private Timestamp created_at;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private Timestamp updated_at;
    private String response_content;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "Asia/Seoul")
    private Timestamp response_date;

    // JOIN fields for admin listing
    private String user_name;    // from user.name
    private String user_email;   // from user.email
}
