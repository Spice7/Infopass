package boot.infopass.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.CardDto;
import boot.infopass.dto.CardSubDto;
import boot.infopass.dto.CardStatusDto;
import boot.infopass.service.CardGameService;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/card")
public class CardController {

	@Autowired
	CardGameService cardGameService;
	
	@PostMapping("/questions")
	public ResponseEntity<Map<String, List<CardDto>>> getAllCards(){
        Map<String, List<CardDto>> result = cardGameService.getAllCards();
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
	}

    @PostMapping("/submit")
    public ResponseEntity<String> postMethodName(@RequestBody CardSubDto cardSub) {
        cardGameService.insertCardSub(cardSub);
        return ResponseEntity.ok("Submission successful");
    }
    
    @PostMapping("/saveResult")
    public ResponseEntity<String> saveGameResult(@RequestBody CardStatusDto gameResult) {
        try {
            cardGameService.saveGameResult(gameResult);
            return ResponseEntity.ok("Result saved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save result: " + e.getMessage());
        }
    }
    
}
