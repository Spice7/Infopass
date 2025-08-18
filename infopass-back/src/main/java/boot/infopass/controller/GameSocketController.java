package boot.infopass.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.service.GameRoomService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GameSocketController {

    private final GameRoomService gameRoomService;

    @MessageMapping("/ready")
    @SendTo("/topic/room")
    public GameRoomPlayerDto playerReday(@Payload GameRoomPlayerDto playerDto){
       // DB에 ready 상태 업데이트
        gameRoomService.updatePlayerReady(playerDto.getId(), true);
        // 모든 플레이어 리스트 반환 (프론트에서 players 갱신)
        return gameRoomService.getPlayersByRoom(playerDto.getRoomId());
    }
}
