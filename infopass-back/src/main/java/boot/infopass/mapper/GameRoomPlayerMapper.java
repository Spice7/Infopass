package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.GameRoomPlayerDto;

@Mapper
public interface GameRoomPlayerMapper {
    void insertPlayer(GameRoomPlayerDto player);

    List<GameRoomPlayerDto> selectPlayersByRoom(Long roomId);

    int updatePlayerReady(Long playerId, Boolean ready);

    int deletePlayer(Long playerId);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    GameRoomPlayerDto selectPlayerById(Long playerId);
}
