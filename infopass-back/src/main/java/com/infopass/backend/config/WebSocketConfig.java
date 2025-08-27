package com.infopass.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${WEBSOCKET_ENDPOINT:/ws-game}")
    private String websocketEndpoint;
    
    @Value("${WEBSOCKET_ALLOWED_ORIGINS:http://3.39.163.37,http://localhost:5173}")
    private String allowedOrigins;
    
    @Value("${WEBSOCKET_HEARTBEAT_INTERVAL:25000}")
    private long heartbeatInterval;
    
    @Value("${WEBSOCKET_DISCONNECT_DELAY:5000}")
    private long disconnectDelay;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 모든 환경에서 동일한 설정 사용
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // 모든 origin 허용
                .withSockJS();
        
        registry.addEndpoint(websocketEndpoint)
                .setAllowedOriginPatterns("*") // 모든 origin 허용
                .withSockJS()
                .setSessionCookieNeeded(false)
                .setHeartbeatTime(heartbeatInterval)
                .setDisconnectDelay(disconnectDelay);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        // 사용자 대상 프리픽스 (예: /user/queue/..)
        config.setUserDestinationPrefix("/user");
    }
}
