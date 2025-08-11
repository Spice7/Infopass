package boot.infopass.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.LobbyDto;
import boot.infopass.mapper.LobbyMapper;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/lobby")
public class LobbyController {

	@Autowired
	LobbyMapper mapper;
	
	@PostMapping("/ox")
	public void InsertOxlobby(@RequestBody LobbyDto dto) {
		mapper.CreateOXLobby(dto);
		log.info("dto : " + dto);
	}
	
}
