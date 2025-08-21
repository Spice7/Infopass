package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.GameRoomDto;

@Mapper
public interface GameRoomMapper {
    int insertRoom(GameRoomDto room);

    GameRoomDto selectRoom(Long id);

    List<GameRoomDto> selectAllRooms();

    int updateRoomStatus(Long id, String status);
}
