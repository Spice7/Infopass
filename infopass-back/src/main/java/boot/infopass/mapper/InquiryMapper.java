package boot.infopass.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.infopass.dto.InquiryDto;

@Mapper
public interface InquiryMapper {
    List<InquiryDto> findInquiries(
        @Param("q") String q,
        @Param("category") String category,
        @Param("userName") String userName,
        @Param("sort") String sort,
        @Param("order") String order,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    int countInquiries(
        @Param("q") String q,
        @Param("category") String category,
        @Param("userName") String userName
    );

    InquiryDto getById(@Param("id") int id);

    int updateStatus(@Param("id") int id, @Param("status") String status);

    int updateReply(
        @Param("id") int id,
        @Param("response_content") String responseContent
    );

    // 사용자용: 문의 등록 및 내 문의 목록 조회(기존 호출 호환)
    void insertInquiry(InquiryDto inquiry);
    List<InquiryDto> selectInquiriesByUserId(@Param("userId") int userId);
}
