package boot.infopass.dto;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MyPageUserDto {
	private int id;
    private String name;
    private String email;
    private int exp;
    private int level;
    private LocalDateTime createdAt;
}
