package boot.infopass.controller;

import boot.infopass.dto.RankedUserDto;
import boot.infopass.service.RankingService;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



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
