package boot.infopass.service;

import java.util.List;

import org.springframework.stereotype.Service;

import boot.infopass.dto.WrongAnswerDto;
import boot.infopass.mapper.WrongAnswerMapper;

@Service
public class WrongAnswerService {
    private final WrongAnswerMapper wrongAnswerMapper;

    public WrongAnswerService(WrongAnswerMapper wrongAnswerMapper) {
        this.wrongAnswerMapper = wrongAnswerMapper;
    }

    public List<WrongAnswerDto> findByUserId(int userId) {
        return wrongAnswerMapper.selectWrongAnswersByUserId(userId);
    }

	public int findUserIdByUsername(String username) {
		// TODO Auto-generated method stub
		return 0;
	}
}
