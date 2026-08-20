package com.tutoring.app.message;

import com.tutoring.app.conversation.Conversation;
import com.tutoring.app.conversation.ConversationRepository;
import com.tutoring.app.lesson.Lesson;
import com.tutoring.app.lesson.LessonRepository;
import com.tutoring.app.offer.TutorOffer;
import com.tutoring.app.user.AesUtils;
import com.tutoring.app.user.CurrentUserService;
import com.tutoring.app.user.User;
import com.tutoring.app.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final AesUtils aesUtils;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageRepository messageRepository, ConversationRepository conversationRepository,
                          UserRepository userRepository, LessonRepository lessonRepository, AesUtils aesUtils,
                          CurrentUserService currentUserService, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.lessonRepository = lessonRepository;
        this.aesUtils = aesUtils;
        this.currentUserService = currentUserService;
        this.messagingTemplate = messagingTemplate;
    }

    public Conversation getOrCreateConversation(UUID receiverId) {
        User sender = currentUserService.get();
        Optional<User> userReceiverOptional = userRepository.findById(receiverId);
        if (userReceiverOptional.isEmpty()) throw new IllegalArgumentException("User not found");

        return conversationRepository.findAll().stream()
                .filter(c -> {
                    UUID cUser1Id = c.getUser1() != null ? c.getUser1().getId() : null;
                    UUID cUser2Id = c.getUser2() != null ? c.getUser2().getId() : null;
                    return cUser1Id != null && cUser2Id != null &&
                            ((sender.getId().equals(cUser1Id) && receiverId.equals(cUser2Id)) ||
                                    (sender.getId().equals(cUser2Id) && receiverId.equals(cUser1Id)));
                })
                .findFirst()
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    User receiver = userReceiverOptional.get();
                    conv.setUser1(sender); conv.setUser2(receiver);
                    conv.setUser1Username(sender.getUsername()); conv.setUser2Username(receiver.getUsername());
                    return conversationRepository.save(conv);
                });
    }

    public MessageDTO sendMessage(UUID receiverId, String content, MessageType messageType, UUID lessonId) throws Exception {
        User sender = currentUserService.get();
        Conversation conversation = getOrCreateConversation(receiverId);
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender); message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt(content));
        message.setConversation(conversation); message.setMessageType(messageType);
        if (lessonId != null) {
            Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            message.setLesson(lesson);
        }
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        messageRepository.save(message);
        MessageDTO dto = new MessageDTO();
        dto.setContent(content); dto.setId(message.getId()); dto.setTimestamp(message.getTimestamp());
        dto.setReceiverId(message.getReceiver().getId()); dto.setSenderId(message.getSender().getId());
        dto.setMessageType(message.getMessageType());
        dto.setConversationId(conversation.getId());
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/notifications", dto);
        return dto;
    }

    public MessageDTO sendOfferInvitation(UUID senderId, UUID receiverId, TutorOffer offer) throws Exception {
        Conversation conversation = getOrCreateConversation(receiverId);
        User sender = currentUserService.get();
        User receiver = userRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        Message message = new Message();
        message.setSender(sender); message.setReceiver(receiver);
        message.setContent(aesUtils.encrypt("Propozycja sesji"));
        message.setConversation(conversation); message.setMessageType(MessageType.INVITATION);
        message.setLesson(offer.getLesson()); message.setOffer(offer);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        messageRepository.save(message);
        MessageDTO dto = new MessageDTO(message);
        dto.setContent("Propozycja sesji");
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/notifications", dto);
        return dto;
    }

    public List<MessageDTO> getMessages(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        verifyParticipant(conversation);
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream().map(msg -> {
            String decrypted;
            try {
                String content = msg.getContent();
                decrypted = (content == null || content.isEmpty()) ? "[Empty message]" : aesUtils.decrypt(content);
            } catch (Exception e) {
                decrypted = "[Message could not be decrypted - possibly encrypted with different key]";
            }
            MessageDTO dto = new MessageDTO(msg);
            dto.setContent(decrypted);
            return dto;
        }).toList();
    }

    public ResponseEntity<String> deleteMessage(UUID id) {
        Optional<Message> optional = messageRepository.findById(id);
        if (optional.isEmpty()) return new ResponseEntity<>("Message not found", HttpStatus.NOT_FOUND);
        if (!optional.get().getSender().getId().equals(currentUserService.get().getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        messageRepository.delete(optional.get());
        return new ResponseEntity<>("Message deleted", HttpStatus.OK);
    }

    private void verifyParticipant(Conversation conversation) {
        UUID currentUserId = currentUserService.get().getId();
        if (!currentUserId.equals(conversation.getUser1().getId()) && !currentUserId.equals(conversation.getUser2().getId())) {
            throw new SecurityException("You are not a participant in this conversation");
        }
    }
}
