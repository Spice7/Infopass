package boot.infopass.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.BlankQuizDto;
import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.dto.GameRoomReadyDto;
import boot.infopass.service.BlankQuizService;
import boot.infopass.service.GameRoomService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GameSocketController {

    private final GameRoomService gameRoomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final BlankQuizService blankQuizService;

    @MessageMapping("/ready")
    public void playerReady(GameRoomReadyDto dto) {
        gameRoomService.setReady(dto.getPlayerId(), true);

        if (gameRoomService.isAllReady(dto.getRoomId())) {
           List<BlankQuizDto> quizList=blankQuizService.getQuizList();
           GameRoomReadyDto startMsg=new GameRoomReadyDto();
           startMsg.setType("start");
           startMsg.setRoomId(dto.getRoomId());
           startMsg.setQuizList(quizList);
           messagingTemplate.convertAndSend("/topic/room"+dto.getRoomId(),startMsg);
        }
    }
}
