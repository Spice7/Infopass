package boot.infopass.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

import boot.infopass.dto.BlankQuizDto;
import boot.infopass.dto.GameRoomDto;
import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.dto.GameRoomReadyDto;
import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.BlankQuizService;
import boot.infopass.service.GameRoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Controller
@RequestMapping("/api/rooms")
public class GameRoomController {
    @Autowired
    private GameRoomService service;

    @Autowired
    private BlankQuizService qservice;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public GameRoomController(GameRoomService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody GameRoomDto dto) {
        Long roomId = service.createRoom(dto);
        Map<String, Long> response = new HashMap<>();
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @ResponseBody
    public List<GameRoomDto> getRooms() {
        return service.getAllRooms();
    }

    @GetMapping("/{roomId}/players")
    @ResponseBody
    public List<GameRoomPlayerDto> getPlayers(@PathVariable Long roomId) {
        return service.getPlayersByRoom(roomId);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable Long roomId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자 인증 정보가 유효하지 않습니다.");
            }

            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            UserDto userDto = customUser.getUserData();

            if (userDto == null || userDto.getNickname() == null || userDto.getNickname().isEmpty()) {
                log.error("컨트롤러에서 가져온 닉네임이 null이거나 비어있습니다. userDto:{}", userDto);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("닉네임 정보가 누락되었습니다");

            }

            service.joinRoom(roomId, userDto);

            List<GameRoomPlayerDto> updatedPlayers = service.getPlayersByRoom(roomId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, updatedPlayers);

            Map<String, String> response = new HashMap<>();
            response.put("message", "방에 성공적으로 참가했습니다");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("방 참가 중 에러 발생:{}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("방 참가에 실패했습니다.");
        }
    }

    /**
     * 클라이언트에서 /app/ready 경로로 메시지를 보낼 때 처리
     */
    @MessageMapping("/ready")
    public void handleReady(@Payload GameRoomReadyMessage message) {
        try {
            log.info("=== WebSocket Ready 메시지 수신 ===");
            log.info("playerId={}, ready={}", message.getPlayerId(), message.isReady());

            // 플레이어 준비 상태 업데이트
            service.setReady(message.getPlayerId(), message.isReady());
            log.info("플레이어 {} 준비 상태 업데이트 완료: {}", message.getPlayerId(), message.isReady());

            // 방 ID 조회
            Long roomId = service.getRoomIdByPlayerId(message.getPlayerId());
            log.info("플레이어 {}의 방 ID: {}", message.getPlayerId(), roomId);

            // 현재 방의 모든 플레이어 조회
            List<GameRoomPlayerDto> currentPlayers = service.getPlayersByRoom(roomId);
            log.info("방 {}의 현재 플레이어 목록: {}", roomId, currentPlayers);

            // 모든 플레이어가 준비되었는지 확인
            boolean allReady = service.isAllReady(roomId);
            log.info("방 {}의 모든 플레이어 준비 상태: {}", roomId, allReady);

            if (allReady) {
                // 모든 플레이어가 준비되었으면 게임 시작
                List<BlankQuizDto> quizList = qservice.getQuizList();
                log.info("=== 게임 시작 조건 충족! ===");
                log.info("방 {}에서 게임 시작 메시지 전송", roomId);
                log.info("퀴즈 개수: {}", quizList.size());

                // 게임 시작 메시지를 /topic/game/start/{roomId}로 전송
                messagingTemplate.convertAndSend("/topic/game/start/" + roomId, quizList);

                log.info("✅ 게임 시작 메시지 전송 완료: /topic/game/start/{}", roomId);
            } else {
                // 준비 상태 변경을 모든 클라이언트에게 알림
                List<GameRoomPlayerDto> updatedPlayers = service.getPlayersByRoom(roomId);
                messagingTemplate.convertAndSend("/topic/room/" + roomId, updatedPlayers);

                long readyCount = updatedPlayers.stream().filter(p -> p.getReady()).count();
                log.info("플레이어 준비 상태 업데이트: 방 {}, 준비된 플레이어 수: {}/{}",
                        roomId, readyCount, updatedPlayers.size());
            }

        } catch (Exception e) {
            log.error("WebSocket Ready 메시지 처리 중 에러 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * WebSocket을 통한 Ready 메시지용 DTO
     */
    public static class GameRoomReadyMessage {
        private Long playerId;
        private boolean ready;

        // 기본 생성자
        public GameRoomReadyMessage() {
        }

        // 생성자
        public GameRoomReadyMessage(Long playerId, boolean ready) {
            this.playerId = playerId;
            this.ready = ready;
        }

        // Getter, Setter
        public Long getPlayerId() {
            return playerId;
        }

        public void setPlayerId(Long playerId) {
            this.playerId = playerId;
        }

        public boolean isReady() {
            return ready;
        }

        public void setReady(boolean ready) {
            this.ready = ready;
        }
    }

    // GameRoomController.java에 추가
    @MessageMapping("/game/end")
    public void handleGameEnd(@Payload Map<String, Object> gameResult) {
        try {
            Long roomId = Long.valueOf(gameResult.get("roomId").toString());
            String nickname = gameResult.get("nickname").toString();

            log.info("게임 종료 메시지 수신: 방 {}, 플레이어 {}", roomId, nickname);

            // 같은 방의 모든 플레이어에게 게임 종료 알림
            messagingTemplate.convertAndSend("/topic/game/end/" + roomId, gameResult);

            // 게임 결과 수집 및 최종 순위 계산 (필요시 구현)
            // 여기서 Redis나 임시 저장소에 결과를 모아서 마지막에 전체 순위를 계산할 수 있음

        } catch (Exception e) {
            log.error("게임 종료 처리 중 오류 발생", e);
        }
    }

    @PostMapping("/player/{playerId}/ready")
    public ResponseEntity<?> setReady(@PathVariable Long playerId, @RequestParam Boolean ready) {
        try {
            log.info("=== HTTP Ready 요청 수신 ===");
            log.info("playerId={}, ready={}", playerId, ready);

            // 플레이어 준비 상태 업데이트
            service.setReady(playerId, ready);
            log.info("플레이어 {} 준비 상태 업데이트 완료: {}", playerId, ready);

            // 방 ID 조회
            Long roomId = service.getRoomIdByPlayerId(playerId);
            log.info("플레이어 {}의 방 ID: {}", playerId, roomId);

            // 현재 방의 모든 플레이어 조회
            List<GameRoomPlayerDto> currentPlayers = service.getPlayersByRoom(roomId);
            log.info("방 {}의 현재 플레이어 목록: {}", roomId, currentPlayers);

            // 모든 플레이어가 준비되었는지 확인
            boolean allReady = service.isAllReady(roomId);
            log.info("방 {}의 모든 플레이어 준비 상태: {}", roomId, allReady);

            if (allReady) {
                // 모든 플레이어가 준비되었으면 게임 시작
                List<BlankQuizDto> quizList = qservice.getQuizList();

                log.info("=== 게임 시작 조건 충족! ===");
                log.info("방 {}에서 게임 시작 메시지 전송", roomId);
                log.info("퀴즈 개수: {}", quizList.size());

                // 게임 시작 메시지를 /topic/game/start/{roomId}로 전송
                messagingTemplate.convertAndSend("/topic/game/start/" + roomId, quizList);

                log.info("✅ 게임 시작 메시지 전송 완료: /topic/game/start/{}", roomId);
            } else {
                // 준비 상태 변경을 모든 클라이언트에게 알림
                List<GameRoomPlayerDto> updatedPlayers = service.getPlayersByRoom(roomId);
                messagingTemplate.convertAndSend("/topic/room/" + roomId, updatedPlayers);

                long readyCount = updatedPlayers.stream().filter(p -> p.getReady()).count();
                log.info("플레이어 준비 상태 업데이트: 방 {}, 준비된 플레이어 수: {}/{}",
                        roomId, readyCount, updatedPlayers.size());
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("HTTP Ready 요청 처리 중 에러 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("준비 상태 변경에 실패했습니다.");
        }

    }

}
