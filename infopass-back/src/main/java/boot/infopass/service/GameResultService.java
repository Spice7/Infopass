package boot.infopass.service;

import java.util.List;

import org.springframework.stereotype.Service;

import boot.infopass.dto.GameResultDto;
import boot.infopass.mapper.GameResultMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GameResultService {
    private final GameResultMapper mapper;

    public List<GameResultDto> getAllResults(int userId) {
        return mapper.getAllResults(userId);
    }

    /**
     * 싱글플레이 결과 저장 (score=0, userExp=세션 누적값, gameType 지정)
     */
    public void createSingleplayResult(int userId, int score, int userExp, String gameType) {
        GameResultDto dto = new GameResultDto();
        dto.setUserId(userId);
        dto.setScore(score);
        dto.setUserExp(userExp);
        dto.setGameType(gameType);
        mapper.CreateSingleplayResult(dto);
    }
}
