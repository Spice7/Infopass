package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.LobbyDto;

@Mapper
public interface LobbyMapper {

	public void CreateOXLobby(LobbyDto dto);
	public void DeleteOXLobby(Integer id);
}
