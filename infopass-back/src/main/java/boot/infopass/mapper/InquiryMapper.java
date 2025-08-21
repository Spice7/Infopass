package boot.infopass.mapper;

import org.apache.ibatis.annotations.Mapper;

import boot.infopass.dto.InquiryDto;

@Mapper
public interface InquiryMapper {
    void insertInquiry(InquiryDto inquiry);
}
