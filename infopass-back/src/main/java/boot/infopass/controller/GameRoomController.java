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
import boot.infopass.service.UserService;
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
                try {
                    // 모든 플레이어가 준비되었으면 게임 시작
                    List<BlankQuizDto> quizList = qservice.getQuizList();

                    log.info("=== 게임 시작 조건 충족! ===");
                    log.info("방 {}에서 게임 시작 메시지 전송", roomId);
                    log.info("퀴즈 개수: {}", quizList.size());

                    // 게임 시작 데이터를 Map으로 구성 (수정된 부분)
                    Map<String, Object> gameStartData = new HashMap<>();
                    gameStartData.put("quizList", quizList);
                    gameStartData.put("players", currentPlayers);
                    gameStartData.put("roomId", roomId);

                    // 객체로 전송 (수정)
                    messagingTemplate.convertAndSend("/topic/game/start/" + roomId, gameStartData);

                    log.info("✅ 게임 시작 메시지 전송 완료: /topic/game/start/{}", roomId);

                } catch (Exception e) {
                    log.error("❌ 게임 시작 처리 중 오류:", e);
                }
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
                try {
                    // 모든 플레이어가 준비되었으면 게임 시작
                    List<BlankQuizDto> quizList = qservice.getQuizList();

                    log.info("🎯 퀴즈 데이터 조회 시작");
                    if (quizList == null) {
                        log.error("❌ 퀴즈 서비스가 null을 반환했습니다");
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("퀴즈 데이터 조회 실패");
                    }

                    log.info("=== 게임 시작 조건 충족! ===");
                    log.info("방 {}에서 게임 시작 메시지 전송", roomId);
                    log.info("퀴즈 개수: {}", quizList.size());
                    log.info("플레이어 수: {}", currentPlayers.size());

                    // 첫 번째 퀴즈 확인
                    if (!quizList.isEmpty()) {
                        BlankQuizDto firstQuiz = quizList.get(0);
                        log.info("📋 첫 번째 퀴즈: id={}, question={}, answer={}",
                                firstQuiz.getId(), firstQuiz.getQuestion(), firstQuiz.getAnswer());
                    }

                    // 게임 시작 데이터를 Map으로 구성 (수정된 부분)
                    Map<String, Object> gameStartData = new HashMap<>();
                    gameStartData.put("quizList", quizList);
                    gameStartData.put("players", currentPlayers); // currentPlayers 사용
                    gameStartData.put("roomId", roomId);

                    log.info("🎮 게임 시작 데이터 전송: quizList={}, players={}, roomId={}",
                            quizList.size(), currentPlayers.size(), roomId);

                    // 객체로 전송 (기존: quizList만 전송 → 수정: gameStartData 전송)
                    messagingTemplate.convertAndSend("/topic/game/start/" + roomId, gameStartData);

                    log.info("✅ 게임 시작 메시지 전송 완료: /topic/game/start/{}", roomId);

                } catch (Exception e) {
                    log.error("❌ 게임 시작 처리 중 오류:", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("게임 시작 중 오류가 발생했습니다: " + e.getMessage());
                }
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

    // 방 나가기 API - CustomUser 활용으로 수정
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable Long roomId, Authentication authentication) {
        try {
            log.info("=== 방 나가기 요청 ===");
            log.info("방 ID: {}, 사용자: {}", roomId, authentication.getName());

            // SecurityContext에서 CustomUser 가져오기 (기존 joinRoom과 동일한 방식)
            if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자 인증 정보가 유효하지 않습니다.");
            }

            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            UserDto userDto = customUser.getUserData();

            if (userDto == null) {
                log.error("사용자 정보를 찾을 수 없습니다: {}", authentication.getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("사용자 정보를 찾을 수 없습니다");
            }

            // 해당 방에서 현재 사용자의 플레이어 정보 조회
            List<GameRoomPlayerDto> players = service.getPlayersByRoom(roomId);
            GameRoomPlayerDto currentPlayer = players.stream()
                    .filter(p -> p.getUserId().equals(userDto.getId()))
                    .findFirst()
                    .orElse(null);

            if (currentPlayer == null) {
                log.warn("사용자 {}는 방 {}에 참여하지 않았습니다", userDto.getId(), roomId);
                return ResponseEntity.ok().body("이미 방에서 나간 상태입니다");
            }

            log.info("방에서 제거할 플레이어: ID={}, 닉네임={}", currentPlayer.getId(), currentPlayer.getNickname());

            // 플레이어를 방에서 제거
            service.removePlayerFromRoom(currentPlayer.getId());

            // 업데이트된 플레이어 목록 조회
            List<GameRoomPlayerDto> updatedPlayers = service.getPlayersByRoom(roomId);
            log.info("방 {}의 업데이트된 플레이어 목록: {}명", roomId, updatedPlayers.size());

            // WebSocket으로 업데이트된 플레이어 목록 전송
            messagingTemplate.convertAndSend("/topic/room/" + roomId, updatedPlayers);
            log.info("✅ 방 나가기 완료, WebSocket 메시지 전송: /topic/room/{}", roomId);

            return ResponseEntity.ok().body("방에서 성공적으로 나갔습니다");

        } catch (Exception e) {
            log.error("❌ 방 나가기 처리 중 오류:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("방 나가기 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

}
