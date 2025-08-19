package boot.infopass.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.GameRoomDto;
import boot.infopass.dto.GameRoomPlayerDto;
import boot.infopass.dto.UserDto;
import boot.infopass.mapper.GameRoomMapper;
import boot.infopass.mapper.GameRoomPlayerMapper;

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
        // 이미 참가한 경우 insert하지 않음
        if (playerMapper.existsByRoomIdAndUserId(roomId, userDto.getId())) {
            return;
        }
        GameRoomPlayerDto newPlayer = new GameRoomPlayerDto();
        newPlayer.setRoomId(roomId);
        newPlayer.setUserId(userDto.getId());
        newPlayer.setNickname(userDto.getNickname());
        newPlayer.setReady(false);
        playerMapper.insertPlayer(newPlayer);
    }

    public void setReady(Long playerId, Boolean ready) {
        playerMapper.updatePlayerReady(playerId, ready);
    }

    public boolean isAllReady(Long roomId) {
        List<GameRoomPlayerDto> players = playerMapper.selectPlayersByRoom(roomId);
        return players.stream().allMatch(GameRoomPlayerDto::getReady);
    }
}
