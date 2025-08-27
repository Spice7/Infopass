package boot.infopass.controller;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.BlankQuizDto;
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

}
