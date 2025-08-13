package boot.infopass.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.infopass.dto.MultiplayerDto;
import boot.infopass.mapper.MultiplayerMapper;

@Service
public class MultiplayerService {
	
	@Autowired
	public MultiplayerMapper multiplayerMapper;
	public int insertMultiplayer(MultiplayerDto multiplayerDto) {
		
		int result = multiplayerMapper.insertMultiplayer(multiplayerDto);
		return result;
	}
}
