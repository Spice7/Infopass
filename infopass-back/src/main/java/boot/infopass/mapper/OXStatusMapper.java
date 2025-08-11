package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.OXQuizStatusDto;

@Mapper
public interface OXStatusMapper {

	public void UserStatus(OXQuizStatusDto dto);
}
