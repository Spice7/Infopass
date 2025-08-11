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
	            .setAllowedOrigins("http://localhost:5173")  // 여기에 클라이언트 주소 명시
	            .withSockJS();
	}

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 구독 주소 prefix
        config.enableSimpleBroker("/topic");

        // 클라이언트가 메시지 보낼 때 prefix
        config.setApplicationDestinationPrefixes("/app");
    }
}