package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.OXQuizSubDto;

@Mapper
public interface OXSubMapper {

	public void insertOxSub(OXQuizSubDto dto);
}
