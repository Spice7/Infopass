package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.InquiryDto;

@Mapper
public interface InquiryMapper {
	public  void insertInquiry(InquiryDto inquiry);

	public List<InquiryDto> selectInquiriesByUserId(int userId);
}
