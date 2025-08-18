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
    public ResponseEntity<Void> joinRoom(@PathVariable Long roomId) {
        // ✅ SecurityContextHolder에서 현재 로그인된 유저의 정보를 가져옴
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // ✅ principal을 CustomUser로 캐스팅하고, 그 안의 UserDto를 가져옴
        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        UserDto userDto = customUser.getUserDto();

        // GameRoomService로 roomId와 userDto를 넘겨줌
        service.joinRoom(roomId, userDto);

        return ResponseEntity.ok().build();
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