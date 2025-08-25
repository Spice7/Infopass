package boot.infopass.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.InquiryDto;
import boot.infopass.mapper.InquiryMapper;

@Service
public class InquiryService {

    @Autowired
    private InquiryMapper inquiryMapper;

    public Map<String, Object> findInquiries(String q, String category, String userName,
                                             String sort, String order, int page, int size) {
        int offset = Math.max(page, 0) * Math.max(size, 1);
        int total = inquiryMapper.countInquiries(q, category, userName);
        List<InquiryDto> items = inquiryMapper.findInquiries(q, category, userName,
                sort, (order == null || order.isBlank()) ? "DESC" : order, offset, size);
        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public InquiryDto getById(int id) {
        return inquiryMapper.getById(id);
    }

    public void updateStatus(int id, String status) {
        inquiryMapper.updateStatus(id, status);
    }

    public void updateReply(int id, String responseContent) {
        inquiryMapper.updateReply(id, responseContent);
    }
}



