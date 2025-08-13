package boot.infopass.dto;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;
@Data
@Alias("BlankQuizDto")
public class BlankQuizDto {

	private Long id;
	private String question;
	private String answer;
	private String category;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime created_at;
}
