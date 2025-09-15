package boot.infopass.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.BlankQuizDto;
import boot.infopass.dto.BlankSubmissionDto;
import boot.infopass.dto.BlankUserStatusDto;


import boot.infopass.service.BlankQuizService;

@RestController
@RequestMapping("/blankgamesingle")
public class BlankController {

    @Autowired
    private BlankQuizService blankQuizeService;

    @GetMapping("/blankquizlist")
    public ResponseEntity<List<BlankQuizDto>> getQuizList() {
        try {
            List<BlankQuizDto> quizList = blankQuizeService.getQuizList();
            return ResponseEntity.ok(quizList);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @PostMapping("/submitblankquiz")
    public ResponseEntity<String> submitQuizAnswer(@RequestBody BlankSubmissionDto submission) {
        try {
            blankQuizeService.submitAnswer(submission);
            return ResponseEntity.ok("답안 제출 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("답안 제출 실패");
        }
    }

    @PostMapping("/blankwronganswer")
    public ResponseEntity<String> recordWrongAnswer(@RequestBody BlankSubmissionDto submission) {
        try {
            blankQuizeService.recordWrongAnswer(submission);
            return ResponseEntity.ok("오답기록 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("오답 기록 실패");
        }
    }

    @PostMapping("/blankinsertuserstatus")
    public ResponseEntity<String> insertUserEntity(@RequestBody BlankUserStatusDto userStatus){
        try{
            blankQuizeService.insertUserStatus(userStatus);
            return ResponseEntity.ok("사용자 상태 저장 완료");
            
        }catch(Exception e){
            return ResponseEntity.internalServerError().body("사용자 상태 저장 실패");
        }
    }

}
