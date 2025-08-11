package boot.infopass.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.controller.OXWebController.Room;
import boot.infopass.dto.LobbyDto;

@Mapper
public interface LobbyMapper {

	public void CreateOXLobby(Room room);
	public List<Room> GetAllLobbys();
	public void DeleteOXLobby(Integer id);
	public void UpdateHost(Room room);
	public void UpdateStatus(Room room);
}
