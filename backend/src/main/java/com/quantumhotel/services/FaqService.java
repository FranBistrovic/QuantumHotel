package com.quantumhotel.services;

import com.quantumhotel.controllers.dto.FaqRequest;
import com.quantumhotel.controllers.dto.FaqResponse;
import com.quantumhotel.entity.Faq;
import com.quantumhotel.repository.FaqRepository;
import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;
    private final UserRepository userRepository;

    public List<FaqResponse> findAll() {
        return faqRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FaqResponse create(FaqRequest dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Faq faq = new Faq();
        faq.setQuestion(dto.getQuestion());
        faq.setAnswer(dto.getAnswer());
        faq.setCreatedAt(Instant.now());
        faq.setCreatedBy(user);

        return mapToResponse(faqRepository.save(faq));
    }

    @Transactional
    public FaqResponse update(Long id, FaqRequest dto, String username) {
        // Optional: check if user is allowed to edit
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ not found"));

        faq.setQuestion(dto.getQuestion());
        faq.setAnswer(dto.getAnswer());
        faq.setEditedAt(Instant.now());

        return mapToResponse(faq);
    }

    @Transactional
    public void delete(Long id, String username) {
        // Optional: check if user is allowed to delete
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        faqRepository.deleteById(id);
    }

    private FaqResponse mapToResponse(Faq faq) {
        FaqResponse response = new FaqResponse();
        response.setId(faq.getId());
        response.setTitle(faq.getQuestion());
        response.setDescription(faq.getAnswer());
        response.setCreated(faq.getCreatedAt() != null ? faq.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null);
        response.setEdited(faq.getEditedAt() != null ? faq.getEditedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null);
        return response;
    }
}
