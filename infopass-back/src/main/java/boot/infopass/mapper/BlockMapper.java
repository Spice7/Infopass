package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.bind.annotation.PathVariable;

import boot.infopass.dto.BlockDTO;

@Mapper
public interface BlockMapper {
	public BlockDTO getSingleData(@PathVariable("id") int id);
	public List<BlockDTO> getAllDatas();
}
