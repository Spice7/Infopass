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
        playerMapper.updatePlayerReady(playerDto, ready);
    }

    public void joinRoom(Long roomId, UserDto userDto) { // ✅ 파라미터 변경
        // 새로운 GameRoomPlayerDto 객체를 생성하고, UserDto의 정보를 담음
        GameRoomPlayerDto newPlayer = new GameRoomPlayerDto();
        newPlayer.setRoomId(roomId);
        newPlayer.setUserId(userDto.getId());
        newPlayer.setNickname(userDto.getNickname()); // ✅ UserDto에서 닉네임 정보를 가져옴
        newPlayer.setReady(false); // 초기 준비 상태는 false

        playerMapper.insertPlayer(newPlayer); // ✅ 수정된 DTO로 mapper 호출
    }

    public void setReady(Long playerId, Boolean ready) {
        playerMapper.updatePlayerReady(playerId, ready);
    }

    public boolean isAllReady(Long roomId) {
        List<GameRoomPlayerDto> players = playerMapper.selectPlayersByRoom(roomId);
        return players.stream().allMatch(GameRoomPlayerDto::getReady);
    }
}
