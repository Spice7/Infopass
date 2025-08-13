package boot.infopass.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import boot.infopass.dto.SocialUserDto;
import boot.infopass.dto.UserDto;
import boot.infopass.mapper.SocialUserMapper;
import boot.infopass.mapper.UserMapper;
import boot.infopass.security.JwtTokenProvider;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class SocialAuthService {

    private final UserMapper userMapper;
    private final SocialUserMapper socialUserMapper;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    public SocialAuthService(UserMapper userMapper, SocialUserMapper socialUserMapper, JwtTokenProvider jwtTokenProvider) {
		
    	this.userMapper = userMapper;
    	this.socialUserMapper = socialUserMapper;
    	this.jwtTokenProvider = jwtTokenProvider;
	}

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${social.kakao.client-id}")
    private String kakaoClientId;

    @Value("${social.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${social.naver.client-id}")
    private String naverClientId;

    @Value("${social.naver.client-secret}")
    private String naverClientSecret;

    @Value("${social.naver.redirect-uri}")
    private String naverRedirectUri;

    //소셜 로그인 토큰생성
    @Transactional    
    public Map<String, Object> socialSignup(String provider, String code, String state) throws Exception {
        String accessToken;
        Map<String, String> userInfo;

        if ("kakao".equalsIgnoreCase(provider)) {
            accessToken = getKakaoAccessToken(code);
            userInfo = getKakaoUserInfo(accessToken);
        } else if ("naver".equalsIgnoreCase(provider)) {
            accessToken = getNaverAccessToken(code, state);
            userInfo = getNaverUserInfo(accessToken);
        } else {
            throw new IllegalArgumentException("지원하지 않는 provider입니다: " + provider);
        }

        // DB 조회 없이 소셜에서 받은 사용자 정보를 그대로 프론트로 넘깁니다.
        Map<String, Object> result = new HashMap<>();
        result.put("provider", provider);
        result.put("providerKey", userInfo.get("id"));
        result.put("email", userInfo.get("email"));
        result.put("username", userInfo.get("username"));
        //전화번호를 받아올때만 result에 추가
        if(!userInfo.get("mobile").equals(null)) {
        result.put("mobile", userInfo.get("mobile"));
        
        }
        log.info("mobile: "+userInfo.get("mobile"));
        

        return result;
    }
    
    //카카오 에센스 토큰 불러오기
    private String getKakaoAccessToken(String code) throws Exception {
        String url = "https://kauth.kakao.com/oauth/token"; // <-- 수정됨

        log.info("getKakaoAccessToken code: {}", code);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=authorization_code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + kakaoRedirectUri   // ⚠️ application*.yml에서 프론트 콜백과 동일해야 함
                + "&code=" + code;

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        JsonNode node = objectMapper.readTree(response.getBody());
        if (node.has("error")) {
            log.info("카카오 AccessToken 요청 실패: {}", node.toString());
            throw new RuntimeException("카카오 AccessToken 요청 실패: " + node.get("error_description").asText());
        }
        return node.get("access_token").asText();
    }

    //카카오 유저 정보 넘겨주기
    private Map<String, String> getKakaoUserInfo(String accessToken) throws Exception {
        String url = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        String id = root.get("id").asText();

        JsonNode kakaoAccount = root.get("kakao_account");
        String email = null;
        String nickname = null;
        if (kakaoAccount != null) {
            if (kakaoAccount.has("email")) email = kakaoAccount.get("email").asText();
            JsonNode profile = kakaoAccount.get("profile");
            if (profile != null && profile.has("nickname")) nickname = profile.get("nickname").asText();
        }

        Map<String, String> map = new HashMap<>();
        map.put("id", id);
        map.put("email", email);
        map.put("username", nickname);
        return map;
    }

    //네이버 에센스 토큰 불러오기
    private String getNaverAccessToken(String code, String state) throws Exception {
        String url = "https://nid.naver.com/oauth2.0/token"
                + "?grant_type=authorization_code"
                + "&client_id=" + naverClientId
                + "&client_secret=" + naverClientSecret
                + "&code=" + code
                + "&state=" + state; // <-- 전달받은 state 사용

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        JsonNode node = objectMapper.readTree(response.getBody());

        if (node.has("error")) {
            throw new RuntimeException("네이버 AccessToken 요청 실패: " + node.get("error_description").asText());
        }
        return node.get("access_token").asText();
    }

    //네이버 유저 정보 넘겨주기
    private Map<String, String> getNaverUserInfo(String accessToken) throws Exception {
        String url = "https://openapi.naver.com/v1/nid/me";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode responseNode = root.get("response");

        String id = responseNode.get("id").asText();
        String email = responseNode.has("email") ? responseNode.get("email").asText() : null;
        String name = responseNode.has("name") ? responseNode.get("name").asText() : null;
        String mobile = responseNode.has("mobile") ? responseNode.get("mobile").asText() : null;

        Map<String, String> map = new HashMap<>();
        map.put("id", id);
        map.put("email", email);
        map.put("username", name);
        map.put("mobile", mobile);
        return map;
    }
}