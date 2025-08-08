//package boot.infopass.controller;
//
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.*;
//
//import lombok.RequiredArgsConstructor;
//import java.util.List;
//import org.springframework.web.bind.annotation.GetMapping;
//
//
//@RestController
//@RequestMapping("/api/rank")
//@RequiredArgsConstructor
//
//public class RankingController {
//    private final RankingService rankingService;
//
//    @GetMapping("/realtime")
//    public List<RankedUserDto> getRealtimeRanking(){
//        return rankingService.getTopRank("rank:realtime",30);
//    }
//
//    @GetMapping("/weekly")
//    public List<RankedUserDto> getWeeklyRanking(){
//        String weekKey=rankingService.getCurrentWeekKey();
//        return rankingService.getTopRank("rank:weekly:"+weekKey,30);
//    }
//
//}
