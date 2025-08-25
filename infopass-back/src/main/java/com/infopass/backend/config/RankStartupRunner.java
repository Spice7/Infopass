package com.infopass.backend.config;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infopass.backend.InfopassBackApplication;

import boot.infopass.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RankStartupRunner {
    private final RankingService rankingService;

    @EventListener(InfopassBackApplication.class)
    public void onApplicationReady() {
        log.info("InfopassBacnApplication:초기player_rank 재계산 시작");
        try {
            rankingService.recalculateRanksFromDb();
            log.info("inttianl player_rank 재계산 완료");
        } catch (Exception e) {
            log.error(("초기 playerrank재계산 실패"), e); // TODO: handle exception
        }
    }
}
