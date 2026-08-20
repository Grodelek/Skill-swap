package com.tutoring.app.config;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.conversation.ConversationRepository;
import com.tutoring.app.user.JWTService;
import com.tutoring.app.user.MyUserDetailsService;
import java.security.Principal;
import java.util.UUID;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthorizationInterceptor implements ChannelInterceptor {
    private final JWTService jwtService;
    private final MyUserDetailsService userDetailsService;
    private final ConversationRepository conversationRepository;

    public WebSocketAuthorizationInterceptor(JWTService jwtService, MyUserDetailsService userDetailsService,
                                             ConversationRepository conversationRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            accessor.setUser(authenticate(accessor));
            return message;
        }

        Principal principal = accessor.getUser();
        if (principal == null) throw new AccessDeniedException("WebSocket authentication is required");
        verifyConversationAccess(accessor.getDestination(), principal.getName());
        return message;
    }

    private Principal authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AccessDeniedException("WebSocket authentication is required");
        }
        String token = authorization.substring(7);
        String username = jwtService.extractUserName(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtService.validateToken(token, userDetails)) {
            throw new AccessDeniedException("Invalid WebSocket token");
        }
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    private void verifyConversationAccess(String destination, String username) {
        if (destination == null || (!destination.startsWith("/topic/whiteboard/")
                && !destination.startsWith("/app/whiteboard/"))) return;
        String id = destination.substring(destination.lastIndexOf('/') + 1);
        Conversation conversation;
        try {
            conversation = conversationRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new AccessDeniedException("Conversation not found"));
        } catch (IllegalArgumentException exception) {
            throw new AccessDeniedException("Invalid conversation id");
        }
        if (!username.equals(conversation.getUser1().getUsername()) && !username.equals(conversation.getUser2().getUsername())) {
            throw new AccessDeniedException("You are not a participant in this conversation");
        }
    }
}
