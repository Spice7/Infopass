package com.infopass.backend.config;

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
        String profile = System.getProperty("spring.profiles.active", "local");
        
        if ("prod".equals(profile)) {
            // 배포 환경 설정
            registry.addEndpoint("/ws")
                    .setAllowedOriginPatterns("*") // 임시로 모든 origin 허용
                    .withSockJS();
            registry.addEndpoint("/ws-game")
                    .setAllowedOriginPatterns("*") // 임시로 모든 origin 허용
                    .withSockJS()
                    .setSessionCookieNeeded(false)
                    .setHeartbeatTime(25000)
                    .setDisconnectDelay(5000);
        } else {
            // 개발 환경 설정
            registry.addEndpoint("/ws")
                    .setAllowedOriginPatterns(
                            "http://localhost:*",
                            "http://127.0.0.1:*",
                            "http://192.168.*.*:*")
                    .withSockJS();
            registry.addEndpoint("/ws-game")
                    .setAllowedOriginPatterns(
                            "http://localhost:*",
                            "http://127.0.0.1:*",
                            "http://192.168.*.*:*")
                    .setAllowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .withSockJS()
                    .setSessionCookieNeeded(false)
                    .setHeartbeatTime(25000)
                    .setDisconnectDelay(5000);
        }
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        // 사용자 대상 프리픽스 (예: /user/queue/..)
        config.setUserDestinationPrefix("/user");
    }
}
