package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.GameResultDto;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GameResultMapper {

	 List<GameResultDto> getAllResults(@Param("userId") int userId);

	 
	 public void CreateMultiplayerResult(GameResultDto dto);
	 public void CreateSingleplayResult(GameResultDto dto);
}
