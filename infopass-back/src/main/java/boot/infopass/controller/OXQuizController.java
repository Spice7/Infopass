package boot.infopass.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.OXQuizDto;
import boot.infopass.mapper.OxQuizMapper;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/oxquiz")
public class OXQuizController {

	@Autowired
	OxQuizMapper mapper;
	
	@GetMapping("/quizlist")
	public List<OXQuizDto> GetAllQuiz(){
		return mapper.GetAllQuiz();
	}
}
