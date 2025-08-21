package boot.infopass.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import boot.infopass.dto.InquiryDto;
import boot.infopass.mapper.InquiryMapper;
import boot.infopass.security.CustomUser;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/inquiries")
public class InquiryController {

    @Autowired
    private InquiryMapper inquiryMapper;

    @PostMapping
    public String submitInquiry(@RequestBody InquiryDto inquiry) {
        try {
            // 현재 로그인 사용자 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
                return "로그인이 필요합니다.";
            }

            CustomUser customUser = (CustomUser) authentication.getPrincipal();
            int userId = customUser.getUserData().getId();

            // InquiryDto에 사용자 ID 설정
            inquiry.setUser_id(userId);

            // DB에 문의 저장
            inquiryMapper.insertInquiry(inquiry);

            return "문의가 성공적으로 제출되었습니다.";
        } catch (Exception e) {
            e.printStackTrace();
            return "문의 제출 중 오류가 발생했습니다.";
        }
    }
    
    @GetMapping("/my") 
    public List<InquiryDto> getMyInquiries() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUser)) {
            return new ArrayList<>(); // 로그인 안 되어 있으면 빈 리스트 반환
        }

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        int userId = customUser.getUserData().getId();

        return inquiryMapper.selectInquiriesByUserId(userId);
    }

}
