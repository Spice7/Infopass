package boot.infopass.security;


import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import boot.infopass.dto.UserDto;
import boot.infopass.mapper.UserMapper;
import boot.infopass.security.contants.SecurityConstants;
import boot.infopass.security.props.JwtProps;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * 🔐 JWT 토큰 관련 기능을 제공해주는 클래스
 * ✅ 토큰 생성
 * ✅ 토큰 해석
 * ✅ 토큰 유효성 검사
 */
@Slf4j
@Component
public class JwtTokenProvider {

	

    @Autowired
    private JwtProps jwtProps;

    @Autowired
    private UserMapper userMapper;

    /*
     * 👩‍💼➡🔐로그인 토큰 생성
     */
    public String createToken(int id, String email, String nickname, List<String> roles) {
        byte[] signingKey = getSigningKey();

        // JWT 토큰 생성
        String jwt = Jwts.builder()
                .signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)      // 서명에 사용할 키와 알고리즘 설정
                // .setHeaderParam("typ", SecurityConstants.TOKEN_TYPE)        // deprecated (version: before 1.0)
                .header()                                                      // update (version : after 1.0)
                    .add("typ", SecurityConstants.TOKEN_TYPE)              // 헤더 설정
                .and() 
                .expiration(new Date(System.currentTimeMillis() + (1000 *60 *60 *24 *10)))  // 토큰 만료 시간 설정 (10일) (1000 *60 *60 *24 *10)
                .claim("uno", "" + id)                                // 클레임 설정: 사용자 번호
                .claim("uid", email)                                  // 클레임 설정: 사용자 아이디
                .claim("nickname", nickname)						  // 클레임 설정: 닉네임
                .claim("rol", roles)								  // 클레임 설정: 권한
                
                .compact();      

        log.info("jwt : " + jwt);

        return jwt;
    }


    /**
     * 🔐➡👩‍💼 토큰 해석
     * 
     * Authorization : Bearer + {jwt}  (authHeader)
     * ➡ jwt 추출 
     * ➡ UsernamePasswordAuthenticationToken
     * @param authHeader
     * @return
     * @throws Exception
     */
    public UsernamePasswordAuthenticationToken getAuthentication(String authHeader) {
        if(authHeader == null || authHeader.length() == 0 ) 
            return null;

        try {
            
            // jwt 추출 
            String jwt = authHeader.replace("Bearer ", "");

            // 🔐➡👩‍💼 JWT 파싱
            Jws<Claims> parsedToken = Jwts.parser()
                                            .verifyWith(getShaKey())
                                            .build()
                                            .parseSignedClaims(jwt);    

            log.info("parsedToken : " + parsedToken);

            // 인증된 사용자 번호
            String userid = parsedToken.getPayload().get("uno").toString();
            int id = ( userid == null ? 0 : Integer.parseInt(userid) );
            log.info("userNo : " + userid);

            // 인증된 사용자 아이디
            String email = parsedToken.getPayload().get("uid").toString();
            log.info("userId : " + email);

            // 인증된 사용자 권한
            Claims claims = parsedToken.getPayload();
            Object roles = claims.get("rol");
            log.info("roles : " + roles);


            // 토큰에 userId 있는지 확인
            if( email == null || email.length() == 0 )
                return null;


            UserDto userDto = new UserDto();
            userDto.setId(id);
            userDto.setEmail(email);
            // OK: 권한도 바로 UserDto 객체에 담아보기            
            // 'roles'가 List<String> 형태라고 가정하고, 이를 콤마(,)로 구분된 단일 문자열로 변환합니다.
            if (roles instanceof List) {
                String userTypeString = ((List<?>) roles).stream()
                                                        .map(Object::toString) // 각 요소를 문자열로 변환
                                                        .collect(Collectors.joining(",")); // 콤마로 연결
                userDto.setUsertype(userTypeString); // UserDto의 usertype 필드에 설정
                log.info("UserDto usertype (from JWT roles): " + userDto.getUsertype());
            } else {
                // roles가 List가 아닌 단일 문자열인 경우 (예: "ADMIN")
                userDto.setUsertype(roles.toString());
                log.info("UserDto usertype (single role from JWT): " + userDto.getUsertype());
            }

            // OK
            // CustomeUser 에 권한 담기
            List<SimpleGrantedAuthority> authorities = ((List<?>) roles )
                                                        .stream()
                                                        .map(auth -> new SimpleGrantedAuthority( (String) auth ))
                                                        .collect( Collectors.toList() );

            // 토큰 유효하면
            // name, email 도 담아주기
            // DB 조회 로직 제거 (CustomUserDetailsService에서 모든 정보 로드)
            try {
                UserDto userInfo = userMapper.getUserData(id);
                if( userInfo != null ) {
                    userDto.setName(userInfo.getName());
                    userDto.setNickname(userInfo.getNickname());
                    userDto.setEmail(userInfo.getEmail());
                    userDto.setPhone(userInfo.getPhone());
                    userDto.setAddress(userInfo.getAddress());
                    userDto.setUsertype(userInfo.getUsertype()); // 이미 위에서 설정했지만, DB 값이 우선이라면 다시 설정
                    userDto.setEnabled(userInfo.getEnabled());
                    userDto.setExp(userInfo.getExp());
                    userDto.setLevel(userInfo.getLevel());
                    userDto.setRank_updated_at(userInfo.getRank_updated_at());
                    userDto.setCreated_at(userInfo.getCreated_at());
                }
            } catch (Exception e) {
                log.error(e.getMessage());
                log.error("토큰 유효 -> DB 추가 정보 조회시 에러 발생...");
            }

            UserDetails userDetails = new CustomUser(userDto);

            // OK
            // new UsernamePasswordAuthenticationToken( 사용자정보객체, 비밀번호, 사용자의 권한(목록)  );
            return new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

        } catch (ExpiredJwtException exception) {
            log.warn("Request to parse expired JWT : {} failed : {}", authHeader, exception.getMessage());
        } catch (UnsupportedJwtException exception) {
            log.warn("Request to parse unsupported JWT : {} failed : {}", authHeader, exception.getMessage());
        } catch (MalformedJwtException exception) {
            log.warn("Request to parse invalid JWT : {} failed : {}", authHeader, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            log.warn("Request to parse empty or null JWT : {} failed : {}", authHeader, exception.getMessage());
        }

        return null;
    }

    // 
    /**
     * 🔐❓ 토큰 유효성 검사
     * @param jwt
     * @return
     *  ⭕ true     : 유효
     *  ❌ false    : 만료
     */
    public boolean validateToken(String jwt) {

        try {

            // 🔐➡👩‍💼 JWT 파싱
           Jws<Claims> claims = Jwts.parser()
                                    .verifyWith(getShaKey())
                                    .build()
                                    .parseSignedClaims(jwt);    

            log.info("::::: 토큰 만료기간 :::::");
            log.info("-> " + claims.getPayload().getExpiration());
            /*
                PAYLOAD
                {
                    "exp": 1703140095,        ⬅ 만료기한 추출
                    "uid": "joeun",
                    "rol": [
                        "ROLE_USER"
                    ]   
                }
            */
           return !claims.getPayload().getExpiration().before(new Date());
       } catch (ExpiredJwtException exception) {
            log.error("Token Expired");                 // 토큰 만료 
            return false;
        } catch (JwtException exception) {
            log.error("Token Tampered");                // 토큰 손상
            return false;
        } catch (NullPointerException exception) {
            log.error("Token is null");                 // 토큰 없음
            return false;
        } catch (Exception e) {
           return false;
       }
    }
    
    // SMS 인증 JWT 토큰 생성 (phone, smsCode 포함)
    public String createSmsToken(String phone, String smsCode) {
    	byte[] signingKey = getSigningKey();
        Map<String, Object> claims = new HashMap<>();
        claims.put("phone", phone);
        claims.put("smsCode", smsCode);
        log.info(smsCode);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 1000 * 60 * 5); //5분

        return Jwts.builder()
        		.signWith(Keys.hmacShaKeyFor(signingKey), Jwts.SIG.HS512)     
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)                
                .compact();
    }

    // SMS 인증 토큰 파싱 및 검증
 // SMS 인증 토큰 파싱 및 검증
    public Map<String, String> parseSmsToken(String token) {
        try {
            Claims claims = Jwts.parser()
                            .verifyWith(getShaKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

        Map<String, String> result = new HashMap<>();
        result.put("phone", claims.get("phone", String.class));
        result.put("smsCode", claims.get("smsCode", String.class));
        return result;

    } catch (JwtException | IllegalArgumentException e) {
        return null;  // 유효하지 않은 토큰
    }
}



    // secretKey ➡ signingKey
    private byte[] getSigningKey() {
      return jwtProps.getSecretKey().getBytes();
   }

    // secretKey ➡ (HMAC-SHA algorithms) ➡ signingKey
    private SecretKey getShaKey() {
        return Keys.hmacShaKeyFor(getSigningKey());
    }

    
}