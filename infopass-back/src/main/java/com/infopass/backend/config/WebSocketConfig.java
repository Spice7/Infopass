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
        registry.addEndpoint("/ws")
                // 개발 환경에서 다양한 로컬 호스트/포트 허용 (필요시 도메인으로 제한 가능)
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
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000") // React 개발 서버
                .withSockJS()
                .setSessionCookieNeeded(false) // 세션 쿠키 불필요
                .setHeartbeatTime(25000) // 하트비트 설정
                .setDisconnectDelay(5000); // 연결 해제 지연
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        // 사용자 대상 프리픽스 (예: /user/queue/..)
        config.setUserDestinationPrefix("/user");
    }
}
