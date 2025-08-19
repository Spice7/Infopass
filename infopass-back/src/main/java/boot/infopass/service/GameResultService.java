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
}
