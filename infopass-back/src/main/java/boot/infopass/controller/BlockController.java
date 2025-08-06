package boot.infopass.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import boot.infopass.dto.BlockDTO;
import boot.infopass.mapper.BlockMapper;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/block")
public class BlockController {
	@Autowired
	BlockMapper mapper;
	
	@GetMapping("/data/{id}")
	public BlockDTO getSingleData(@PathVariable("id") int id) {
		return mapper.getSingleData(id);
	}
}
