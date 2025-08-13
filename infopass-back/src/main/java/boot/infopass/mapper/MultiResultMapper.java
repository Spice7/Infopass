package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.MultiResultDto;

@Mapper
public interface MultiResultMapper {

	public void CreateResult(MultiResultDto dto);
}
