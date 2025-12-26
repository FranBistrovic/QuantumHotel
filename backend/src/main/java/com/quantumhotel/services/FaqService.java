package com.quantumhotel.services;

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

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;
    private final UserRepository userRepository;

    public List<Faq> findAll() {
        return faqRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    @Transactional
    public Faq create(String username, String question, String answer) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Faq faq = new Faq();
        faq.setQuestion(question);
        faq.setAnswer(answer);
        faq.setCreatedAt(Instant.now());
        faq.setCreatedBy(user); // now a managed entity

        return faqRepository.save(faq);
    }

    @Transactional
    public Faq update(Long id, String question, String answer) {

        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FAQ not found"));

        faq.setQuestion(question);
        faq.setAnswer(answer);
        faq.setEditedAt(Instant.now());

        return faq;
    }

    @Transactional
    public void delete(Long id) {
        faqRepository.deleteById(id);
    }
}
