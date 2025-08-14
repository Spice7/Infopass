package boot.infopass.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import boot.infopass.controller.AdminController;
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

    private final AdminController adminController;

    private final UserMapper userMapper;
    private final SocialUserMapper socialUserMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public SocialAuthService(UserMapper userMapper, SocialUserMapper socialUserMapper,
            JwtTokenProvider jwtTokenProvider, AdminController adminController) {

        this.userMapper = userMapper;
        this.socialUserMapper = socialUserMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.adminController = adminController;
    }

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${social.kakao.client-id}")
    private String kakaoClientId;

    @Value("${social.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${social.kakao.client-secret:}") // ← client-secret 주입
    private String kakaoClientSecret;

    @Value("${social.naver.client-id}")
    private String naverClientId;

    @Value("${social.naver.client-secret}")
    private String naverClientSecret;

    @Value("${social.naver.redirect-uri}")
    private String naverRedirectUri;

    // 소셜 로그인 토큰생성
    @Transactional
    public Map<String, Object> socialSignup(String provider, String code, String state) throws Exception {
        String accessToken;
        Map<String, String> userInfo;

        if ("kakao".equalsIgnoreCase(provider)) {
            accessToken = getKakaoAccessToken(code, state);
            userInfo = getKakaoUserInfo(accessToken);
        } else if ("naver".equalsIgnoreCase(provider)) {
            accessToken = getNaverAccessToken(code, state);
            userInfo = getNaverUserInfo(accessToken);
        } else {
            throw new IllegalArgumentException("지원하지 않는 provider입니다: " + provider);
        }

        // 1. 소셜 유저 DB 조회
        Map<String, String> searchParams = new HashMap<>();
        searchParams.put("provider", provider);
        searchParams.put("providerKey", userInfo.get("id"));

        // DB 조회
        SocialUserDto socialUserDto = socialUserMapper.findByProviderAndKey(searchParams);
        Map<String, Object> result = new HashMap<>();
        if (socialUserDto != null) {
            // 이미 회원이면 로그인 처리
            UserDto user = userMapper.getUserData(socialUserDto.getUser_id());
            String token = jwtTokenProvider.createToken(user.getId(), user.getEmail(), user.getNickname(),
                    List.of(user.getUsertype()));
            result.put("login", true);
            result.put("token", token);
            result.put("user", user);
            return result;
        } else {

            // 유저 email 중복 체크
            boolean userCheck = userMapper.findById(userInfo.get("email"));

            if (userCheck) {
                // 이메일이 이미 DB에 있으면 회원가입 불가 안내
                result.put("login", false);
                result.put("error", "이미 가입된 이메일입니다.");
                return result; // 바로 리턴
            }

            // 회원이 아니고 email 중복이 없으면 회원가입용 정보 반환
            result.put("login", false);
            result.put("provider", provider);
            result.put("providerKey", userInfo.get("id"));
            result.put("email", userInfo.get("email"));
            result.put("username", userInfo.get("username"));
            if (userInfo.get("mobile") != null) {
                result.put("mobile", userInfo.get("mobile"));
            }
            return result;
        }        
    }

    // 카카오 에센스 토큰 불러오기
    private String getKakaoAccessToken(String code, String state) throws Exception {
        String url = "https://kauth.kakao.com/oauth/token";

        log.info("getKakaoAccessToken code: {}", code);
        log.info("getKakaoAccessToken state: {}", state);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "grant_type=authorization_code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + kakaoRedirectUri // ⚠️ application*.yml에서 프론트 콜백과 동일해야 함
                + "&client_secret=" + kakaoClientSecret // ⚠️ client-secret이 설정되어 있어야 함
                + "&code=" + code
                + "&state=" + state;

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        JsonNode node = objectMapper.readTree(response.getBody());
        if (node.has("error")) {
            log.info("카카오 AccessToken 요청 실패: {}", node.toString());
            throw new RuntimeException("카카오 AccessToken 요청 실패: " + node.get("error_description").asText());
        }
        return node.get("access_token").asText();
    }

    // 카카오 유저 정보 넘겨주기
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
        String phone_number = null;
        String mobile = null;
        String username = null;
        if (kakaoAccount != null) {
            if (kakaoAccount.has("email"))
                email = kakaoAccount.get("email").asText();
            JsonNode profile = kakaoAccount.get("profile");
            if (kakaoAccount.has("phone_number"))
                phone_number = kakaoAccount.get("phone_number").asText();
            if (kakaoAccount.has("name"))
                username = kakaoAccount.get("name").asText();

        }

        Map<String, String> map = new HashMap<>();
        mobile = phone_number.replace("+82", "0").replaceAll("\\s+", "");
        map.put("id", id);
        map.put("email", email);
        map.put("username", username);
        map.put("mobile", mobile);
        return map;
    }

    // 네이버 에센스 토큰 불러오기
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

    // 네이버 유저 정보 넘겨주기
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

    public void insertSocialUser(SocialUserDto socialUserDto) {

        // 내일와서 소셜 유저 mapper만들어라!!
        socialUserMapper.insertSocialUser(socialUserDto);
    }
}