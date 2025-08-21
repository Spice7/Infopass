package boot.infopass.dto;

import lombok.Data;
import lombok.ToString;
import java.sql.Timestamp;

@Data
public class InquiryDto {

	
	private int id; // auto-generated
    private int userId;
    private String title;
    private String category;
    private String content;
    private String status;
    private Timestamp createdAt; // auto-generated
    private Timestamp updatedAt; // auto-generated
    private String responseContent;
    private Timestamp responseDate;
	
}
