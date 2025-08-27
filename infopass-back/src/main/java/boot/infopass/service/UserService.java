package boot.infopass.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;
import boot.infopass.security.JwtTokenProvider;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;

@Slf4j
@Service
public class UserService implements UserServiceInter {
	//NCSWRUTBOE0H7R30
	private static final String API_KEY = "NCSWRUTBOE0H7R30";
    private static final String API_SECRET = "I6JCDOPD9W9JNEGBV17UWB482VTWXYVG";
    private static final String FROM_PHONE = "01026312803";
	
    private final DefaultMessageService coolsms;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

   @Autowired
    public UserService(UserMapper userMapper, JwtTokenProvider jwtTokenProvider, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userMapper = userMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.coolsms = new DefaultMessageService(API_KEY, API_SECRET, "https://api.coolsms.co.kr");
    }

	@Override
	public UserDto insertUser(UserDto userDto) {
		// 비밀번호 암호화
		String password = userDto.getPassword();
		String encodedPw = bCryptPasswordEncoder.encode(password);
		userDto.setPassword(encodedPw);
		
		// 기본 권한 설정 (DB 저장 전에 설정)
		userDto.setUsertype("USER"); // 기본 권한 : 사용자 권한 (ROLE_USER)
		
		// 회원 등록
		userMapper.insertUser(userDto);
		
		return userDto;
	}

	@Override
	public UserDto getUserData(Integer id) {

		return userMapper.getUserData(id);
	}	
	
	@Override
	public boolean findById(String email) {
		// TODO Auto-generated method stub
		
		return userMapper.findById(email);
	}

	@Override
    public UserDto updateUser(Long id, UserDto updatedUserDto) {
        updatedUserDto.setId(id.intValue());
        int result = userMapper.updateUser(updatedUserDto);  // UserMapper 메서드 호출
        if (result > 0) {
            return userMapper.getUserData(updatedUserDto.getId());
        } else {
            return null;
        }
    }

	@Override
	public boolean findByNickName(String nickname) {
		// TODO Auto-generated method stub
		return userMapper.findByNickName(nickname);
	}

	@Override
	public Map<String, String> sendSms(String phone) {
		// 6자리 인증번호 생성
		String verificationCode = String.valueOf((int) (Math.random() * 900000) + 100000);

		// 문자 발송 준비
		Message message = new Message();
		message.setFrom(FROM_PHONE);
		message.setTo(phone);
		message.setText("[SSY.COM] 인증번호는 " + verificationCode + " 입니다.");

		Map<String, String> result = new HashMap<>();

		try {
			coolsms.send(message); //msg 보내기

			log.info("생성된 인증번호 : "+verificationCode);

			// 인증번호와 휴대폰 번호로 SMS 토큰 생성
			String smsToken = jwtTokenProvider.createSmsToken(phone, verificationCode);
			result.put("smsToken", smsToken);
			return result;

		} catch (Exception e) {
			e.printStackTrace();
			result.put("error", "문자 발송에 실패했습니다. 다시 시도해주세요.");
			return result;
		}
	}

	@Override
	public Map<String, String> verifyCode(String phone, String code, HttpSession session) {
		
		String verificationCode =(String)session.getAttribute("smsCode");
		String phoneNumber = (String)session.getAttribute("phone");
		log.info("verificationCode: "+verificationCode);
		log.info("phoneNumber: "+phoneNumber);
		Map<String, String> map = new HashMap<>();
		if(phone.equals(phoneNumber)) {
			if(code.equals(verificationCode)) {
				map.put("code", "ok");
				session.removeAttribute("phone");
				session.removeAttribute("smsCode");
				
			}else {
				map.put("code", "no");
				log.info("인증번호가 다릅니다"+code);	
			}
		}else {
			map.put("code", "no");
			log.info("휴대폰번호가 다릅니다"+phone);
		}
		
		return map;
	}

	public List<UserDto> findByPhone(String phone) {
		List<UserDto> users = userMapper.findByPhone(phone);
		return users;
	}

	@Override
	public String getResearchEmail(UserDto userDto) {		
		return userMapper.getResearchEmail(userDto);
	}

	@Override
	public boolean findPwCheck(UserDto userDto) {		
		return userMapper.findPwCheck(userDto);
	}

	@Override
	public void changePw(UserDto userDto) {
		// 비밀번호 변경 로직
		
		String encodedPw = bCryptPasswordEncoder.encode(userDto.getPassword());
		userDto.setPassword(encodedPw);
		userMapper.changePw(userDto);
	}
	
	private static final int EXP_PER_LEVEL = 100;

	// 현재 exp/level 값을 기준으로 레벨업을 처리하고 exp를 정규화	// 게임마다 공용으로 사용 가능
	private UserDto processLeveling(UserDto user) {
		int currentExp = (user.getExp() == null ? 0 : user.getExp());
		int currentLevel = (user.getLevel() == null ? 0 : user.getLevel());

		// 음수 경험치 방어		// 우린 레벨다운이 없다
		if (currentExp < 0) {
			currentExp = 0;
		}

		while (currentExp >= EXP_PER_LEVEL) {
			currentLevel++;
			currentExp -= EXP_PER_LEVEL;
		}

		user.setExp(currentExp);
		user.setLevel(currentLevel);
		return user;
	}

	/**
	 * 사용자 경험치를 증감하고 레벨업(또는 클램프)을 처리한 뒤, 최신 사용자 정보를 반환한다.
	 * 음수 입력이 들어올 경우, 레벨 다운은 하지 않으며 현재 레벨 내에서 exp는 0 미만으로 내려가지 않도록 0으로 클램프한다.
	 */
	public UserDto applyExpAndProcessLevel(int userId, int expDelta) {
		UserDto user = userMapper.getUserById(userId);
		if (user == null) {
			return null;
		}

		int newExp = (user.getExp() == null ? 0 : user.getExp()) + expDelta;
		user.setExp(newExp);
		processLeveling(user);
		userMapper.updateUserExpAndLevel(user);
		return userMapper.getUserById(userId);
	}

	public void checkAndProcessLevelUp(int userId) {
        // 현재 사용자 정보 조회 (최신 exp와 level)
        UserDto user = userMapper.getUserById(userId);
        if (user == null) {
            System.out.println("사용자를 찾을 수 없습니다: " + userId);
            return;
        }

        // 공용 레벨 계산 로직
        processLeveling(user);

        // 변경된 경험치와 레벨을 DB에 업데이트
        userMapper.updateUserExpAndLevel(user);
    }
	
    
}
