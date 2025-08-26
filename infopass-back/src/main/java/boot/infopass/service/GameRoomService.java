package boot.infopass.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.GameRoomDto;
import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.dto.UserDto;
import boot.infopass.mapper.GameRoomMapper;
import boot.infopass.mapper.GameRoomPlayerMapper;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GameRoomService {
    @Autowired
    private GameRoomMapper roomMapper;
    @Autowired
    private GameRoomPlayerMapper playerMapper;

    public Long createRoom(GameRoomDto dto) {
        roomMapper.insertRoom(dto);
        return dto.getId();
    }

    public List<GameRoomDto> getAllRooms() {
        return roomMapper.selectAllRooms();
    }

    public List<GameRoomPlayerDto> getPlayersByRoom(Long roomId) {
        return playerMapper.selectPlayersByRoom(roomId);
    }

    public void updatePlayerReady(GameRoomPlayerDto playerDto, boolean ready) {
        playerMapper.updatePlayerReady(playerDto.getId(), ready);
    }

    public void joinRoom(Long roomId, UserDto userDto) {
        Integer userIdInt = userDto.getId();
        if (userIdInt == null)
            return;

        if (playerMapper.existsByRoomIdAndUserId(roomId, userIdInt.longValue())) {
            return;
        }
        GameRoomPlayerDto newPlayer = new GameRoomPlayerDto();
        newPlayer.setRoomId(roomId);
        newPlayer.setUserId(userIdInt); // Integer 타입으로 전달
        newPlayer.setNickname(userDto.getNickname());
        newPlayer.setReady(false);
        playerMapper.insertPlayer(newPlayer);
    }

    public void setReady(Long playerId, Boolean ready) {
        playerMapper.updatePlayerReady(playerId, ready);
    }

    public boolean isAllReady(Long roomId) {
        List<GameRoomPlayerDto> players = playerMapper.selectPlayersByRoom(roomId);
        /* return players.stream().allMatch(GameRoomPlayerDto::getReady); */
        // 최소 2명 이상이어야 게임 시작 가능
        if (players.size() < 2) {
            log.info("방 {}의 플레이어 수가 부족합니다: {}명 (최소 2명 필요)", roomId, players.size());
            return false;
        }

        // 모든 플레이어가 준비 상태인지 확인
        boolean allReady = players.stream().allMatch(GameRoomPlayerDto::getReady);

        log.info("방 {}의 준비 상태 확인: 총 {}명, 모두 준비됨: {}", roomId, players.size(), allReady);

        return allReady;
    }

    public Long getRoomIdByPlayerId(Long playerId) {
        GameRoomPlayerDto player = playerMapper.selectPlayerById(playerId);
        return player != null ? player.getRoomId() : null;
    }
}
