package boot.infopass.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class RankedUserDto {
    private Long userId;
    private String nickname;
    private String prifileImage;
    private int totalScore;
}
