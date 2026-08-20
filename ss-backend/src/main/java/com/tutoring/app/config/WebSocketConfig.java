package com.tutoring.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  private final WebSocketAuthorizationInterceptor webSocketAuthorizationInterceptor;

  public WebSocketConfig(WebSocketAuthorizationInterceptor webSocketAuthorizationInterceptor) {
    this.webSocketAuthorizationInterceptor = webSocketAuthorizationInterceptor;
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "queue");
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry config) {
    config.addEndpoint("/ws")
        .setAllowedOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8081",
            "http://localhost:19006",
            "http://localhost:19000",
            "http://192.168.1.32:5173",
            "http://192.168.2.167:8081")
        .withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(webSocketAuthorizationInterceptor);
  }
}
