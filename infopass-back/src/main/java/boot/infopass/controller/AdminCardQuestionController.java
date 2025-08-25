package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import boot.infopass.dto.CardDto;
import boot.infopass.service.AdminCardQuestionService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin/card-questions")
public class AdminCardQuestionController {

	@Autowired
	private AdminCardQuestionService service;

	@GetMapping
	public ResponseEntity<?> list(
			@RequestParam(name = "q", required = false) String q,
			@RequestParam(name = "subject", required = false) String subject,
			@RequestParam(name = "page", defaultValue = "0") Integer page,
			@RequestParam(name = "size", defaultValue = "20") Integer size
	) {
		return ResponseEntity.ok(service.list(q, subject, page, size));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> detail(@PathVariable("id") Integer id) {
		CardDto dto = service.findById(id);
		if (dto == null) return ResponseEntity.notFound().build();
		return ResponseEntity.ok(dto);
	}

	@PostMapping
	public ResponseEntity<?> create(@RequestBody CardDto dto) {
		if (dto.getQuestion() == null || dto.getQuestion().trim().isEmpty() ||
			dto.getAnswer() == null || dto.getAnswer().trim().isEmpty() ||
			dto.getSubject() == null || dto.getSubject().trim().isEmpty() ||
			dto.getExplanation_text() == null || dto.getExplanation_text().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer/subject/explanation_text는 필수"));
		}
		service.insert(dto);
		return ResponseEntity.ok(Map.of("success", true, "id", dto.getId()));
	}

	// 최소 8쌍(=16개) 보장: subject가 같고 question/answer 1:1 짝으로 전달된다고 가정
	@PostMapping("/bulk")
	public ResponseEntity<?> bulkCreate(@RequestBody List<CardDto> dtos) {
		if (dtos == null || dtos.size() < 8) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "최소 8쌍(=8행) 이상 등록해야 합니다."));
		}
		String subject = dtos.get(0).getSubject();
		for (CardDto d : dtos) {
			if (d.getQuestion() == null || d.getQuestion().trim().isEmpty() ||
				d.getAnswer() == null || d.getAnswer().trim().isEmpty() ||
				d.getSubject() == null || d.getSubject().trim().isEmpty() ||
				d.getExplanation_text() == null || d.getExplanation_text().trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer/subject/explanation_text는 필수"));
			}
			if (!subject.equals(d.getSubject())) {
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "하나의 subject로만 일괄 등록 가능합니다."));
			}
		}
		int[] results = service.bulkInsert(dtos);
		return ResponseEntity.ok(Map.of("success", true, "inserted", results.length));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable("id") Integer id, @RequestBody CardDto dto) {
		CardDto exist = service.findById(id);
		if (exist == null) return ResponseEntity.notFound().build();
		if (dto.getQuestion() == null || dto.getQuestion().trim().isEmpty() ||
			dto.getAnswer() == null || dto.getAnswer().trim().isEmpty() ||
			dto.getSubject() == null || dto.getSubject().trim().isEmpty() ||
			dto.getExplanation_text() == null || dto.getExplanation_text().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer/subject/explanation_text는 필수"));
		}
		dto.setId(id);
		service.update(dto);
		return ResponseEntity.ok(Map.of("success", true));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
		CardDto exist = service.findById(id);
		if (exist == null) return ResponseEntity.notFound().build();
		service.delete(id);
		return ResponseEntity.ok(Map.of("success", true));
	}
}


