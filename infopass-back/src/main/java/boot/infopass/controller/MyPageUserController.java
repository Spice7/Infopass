package boot.infopass.controller;

import org.springframework.web.bind.annotation.*;
import boot.infopass.dto.MyPageUserDto;
import boot.infopass.service.MyPageUserService;

@RestController
@RequestMapping("/api/mypage/user")
public class MyPageUserController {

    private final MyPageUserService myPageUserService;

    public MyPageUserController(MyPageUserService myPageUserService) {
        this.myPageUserService = myPageUserService;
    }

    @GetMapping("/{id}")
    public MyPageUserDto getUser(@PathVariable int id) {
        return myPageUserService.getUserById(id);
    }
}
