package boot.infopass.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GameRoomPlayerDto {
    private Long id;
    private Long roomId;
    private Integer userId;
    private String nickname; // 반드시 선언!
    private Boolean ready;
    private LocalDateTime joinedAt;
}
