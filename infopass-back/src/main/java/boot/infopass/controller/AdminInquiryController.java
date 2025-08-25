package boot.infopass.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.InquiryDto;
import boot.infopass.service.InquiryService;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "sort", required = false, defaultValue = "i.created_at") String sort,
            @RequestParam(value = "order", required = false, defaultValue = "DESC") String order,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(inquiryService.findInquiries(q, category, userName, sort, order, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDto> get(@PathVariable("id") int id) {
        InquiryDto dto = inquiryService.getById(id);
        return dto == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable("id") int id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        inquiryService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Void> updateReply(@PathVariable("id") int id, @RequestBody Map<String, String> body) {
        String responseContent = body.get("response_content");
        inquiryService.updateReply(id, responseContent);
        return ResponseEntity.ok().build();
    }
}



