package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.MultiplayerDto;


@Mapper
public interface MultiplayerMapper {
	
	public int insertMultiplayer(MultiplayerDto multiplayerDto);
	
}
