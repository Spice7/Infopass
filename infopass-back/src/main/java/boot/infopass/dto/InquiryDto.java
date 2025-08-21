package boot.infopass.dto;

import lombok.Data;
import lombok.ToString;
import java.sql.Timestamp;

@Data
public class InquiryDto {

	
	private int id; // auto-generated
    private int user_id;
    private String title;
    private String category;
    private String content;
    private String status;
    private Timestamp created_at; // auto-generated
    private Timestamp updated_at; // auto-generated
    private String response_content;
    private Timestamp response_date;
	
}
