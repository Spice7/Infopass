package boot.infopass.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // 개발 환경에서 다양한 로컬 호스트/포트 허용 (필요시 도메인으로 제한 가능)
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .withSockJS();
	}

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 구독 주소 prefix (브로드캐스트와 1:1 큐 모두 지원)
        config.enableSimpleBroker("/topic", "/queue");

        // 클라이언트가 메시지 보낼 때 prefix
        config.setApplicationDestinationPrefixes("/app");

        // 사용자 대상 프리픽스 (예: /user/queue/..)
        config.setUserDestinationPrefix("/user");
    }
}