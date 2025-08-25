package boot.infopass.security.props;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")     // boot.infopass.security 경로 하위 속성들을 지정
public class JwtProps {
    
    // boot.infopass.security.secretKey로 지정된 프로퍼티 값을 주입받는 필드
    // ✅ boot.infopass.security.secret-key ➡ secretKey : {인코딩된 시크릿 키}
	
    private String secretKey;
    
    // Lombok @Data를 사용한다면 getter/setter는 자동으로 생성됩니다.
    // Lombok을 사용하지 않는다면 getSecretKey(), setSecretKey() 메서드를 직접 구현해야 합니다.
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
}