package boot.infopass.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GameRoomDto {
    private Long id;
    private String roomName;
    private Integer maxPlayers;
    private String status;
    private LocalDateTime createdAt;
}
