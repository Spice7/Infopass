package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import boot.infopass.dto.OXQuizAdminDto;
import boot.infopass.service.AdminOXQuestionService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin/ox-questions")
public class AdminOXQuestionController {

	@Autowired
	private AdminOXQuestionService service;

	@GetMapping
	public ResponseEntity<?> list(
			@RequestParam(name = "q", required = false) String q,
			@RequestParam(name = "category", required = false) String category,
			@RequestParam(name = "page", defaultValue = "0") Integer page,
			@RequestParam(name = "size", defaultValue = "20") Integer size
	) {
		return ResponseEntity.ok(service.list(q, category, page, size));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> detail(@PathVariable("id") Integer id) {
		OXQuizAdminDto dto = service.findById(id);
		if (dto == null) return ResponseEntity.notFound().build();
		return ResponseEntity.ok(dto);
	}

	@PostMapping
	public ResponseEntity<?> create(@RequestBody OXQuizAdminDto dto) {
		if (dto.getQuestion() == null || dto.getQuestion().trim().isEmpty() ||
			dto.getAnswer() == null || (dto.getAnswer() != 0 && dto.getAnswer() != 1) ||
			dto.getCategory() == null || dto.getCategory().trim().isEmpty() ||
			dto.getQuiz_explanition() == null || dto.getQuiz_explanition().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer(0 or 1)/category/quiz_explanition는 필수"));
		}
		service.insert(dto);
		return ResponseEntity.ok(Map.of("success", true, "id", dto.getId()));
	}

	@PostMapping("/bulk")
	public ResponseEntity<?> bulkCreate(@RequestBody List<OXQuizAdminDto> dtos) {
		if (dtos == null || dtos.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "등록할 문제가 없습니다."));
		}
		String category = dtos.get(0).getCategory();
		for (OXQuizAdminDto d : dtos) {
			if (d.getQuestion() == null || d.getQuestion().trim().isEmpty() ||
				d.getAnswer() == null || (d.getAnswer() != 0 && d.getAnswer() != 1) ||
				d.getCategory() == null || d.getCategory().trim().isEmpty() ||
				d.getQuiz_explanition() == null || d.getQuiz_explanition().trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer(0 or 1)/category/quiz_explanition는 필수"));
			}
			if (!category.equals(d.getCategory())) {
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "하나의 category로만 일괄 등록 가능합니다."));
			}
		}
		int[] results = service.bulkInsert(dtos);
		return ResponseEntity.ok(Map.of("success", true, "inserted", results.length));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable("id") Integer id, @RequestBody OXQuizAdminDto dto) {
		OXQuizAdminDto exist = service.findById(id);
		if (exist == null) return ResponseEntity.notFound().build();
		if (dto.getQuestion() == null || dto.getQuestion().trim().isEmpty() ||
			dto.getAnswer() == null || (dto.getAnswer() != 0 && dto.getAnswer() != 1) ||
			dto.getCategory() == null || dto.getCategory().trim().isEmpty() ||
			dto.getQuiz_explanition() == null || dto.getQuiz_explanition().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "question/answer(0 or 1)/category/quiz_explanition는 필수"));
		}
		dto.setId(id);
		service.update(dto);
		return ResponseEntity.ok(Map.of("success", true));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
		try {
			System.out.println("삭제 요청 받음 - ID: " + id);
			
			OXQuizAdminDto exist = service.findById(id);
			if (exist == null) {
				System.out.println("삭제할 문제를 찾을 수 없음 - ID: " + id);
				return ResponseEntity.notFound().build();
			}
			
			int deletedRows = service.delete(id);
			System.out.println("삭제된 행 수: " + deletedRows);
			
			if (deletedRows > 0) {
				return ResponseEntity.ok(Map.of("success", true));
			} else {
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "삭제에 실패했습니다."));
			}
		} catch (Exception e) {
			System.err.println("삭제 중 예외 발생: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "서버 오류: " + e.getMessage()));
		}
	}
}
