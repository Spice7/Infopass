package boot.infopass.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.service.RankingService;
import lombok.RequiredArgsConstructor;



@RestController 
@RequestMapping("/rank")
@RequiredArgsConstructor

public class RankingController {
   private final RankingService rankingService;

   @GetMapping()
    public List<RankedUserDto> getRanking(@RequestParam String type){
        return rankingService.getRank(type);
    }
   



}
