package boot.infopass.dto;

import java.util.List;

import lombok.Data;

@Data
public class GameRoomReadyDto {
    private Long roomId;
    private Long playerId;
    private String type;
    private List<BlankQuizDto> quizList;
}
