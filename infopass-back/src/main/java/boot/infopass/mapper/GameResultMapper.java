package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.GameResultDto;
import io.lettuce.core.dynamic.annotation.Param;

@Mapper
public interface GameResultMapper {

	 List<GameResultDto> getAllResults(@Param("userId") int userId);

	 
	 public void CreateResult(GameResultDto dto);
}
