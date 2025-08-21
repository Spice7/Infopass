package boot.infopass.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.GameRoomDto;
import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.dto.UserDto;
import boot.infopass.security.CustomUser;
import boot.infopass.service.GameRoomService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/rooms")
public class GameRoomController {
    @Autowired
    private GameRoomService service;

    // 생성자 주입
    public GameRoomController(GameRoomService service) {
        this.service = service;
    }

    // 방 생성 후
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody GameRoomDto dto) {
        Long roomId = service.createRoom(dto);
        Map<String, Long> response = new HashMap<>();
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<GameRoomDto> getRooms() {
        return service.getAllRooms();
    }

    // 방의 모든 플레이어 리스트 반환
    @GetMapping("/{roomId}/players")
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

            // 닉네임이 null이거나 비어 있는지 확인
            if (userDto == null || userDto.getNickname() == null || userDto.getNickname().isEmpty()) {
                log.error("컨트롤러에서 가져온 닉네임이 null이거나 비어 있습니다. userDto: {}", userDto);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("닉네임 정보가 누락되었습니다.");
            }

            // GameRoomService.joinRoom(Long roomId, UserDto userDto) 메서드 호출
            service.joinRoom(roomId, userDto);

            Map<String, String> response = new HashMap<>();
            response.put("message", "방에 성공적으로 참가했습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("방 참가 중 에러 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("방 참가에 실패했습니다.");
        }
    }

    @PostMapping("/player/{playerId}/ready")
    public ResponseEntity<?> setReady(@PathVariable Long playerId, @RequestParam Boolean ready) {
        service.setReady(playerId, ready);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/allready")
    public boolean isAllReady(@PathVariable Long roomId) {
        return service.isAllReady(roomId);
    }
}