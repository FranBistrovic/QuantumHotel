package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
@Table(name = "faq")
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "q_id")
    private Long id;

    @Column(name = "q_question", columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "q_answer", columnDefinition = "TEXT", nullable = false)
    private String answer;

    @Column(name = "q_created", nullable = false)
    private Instant createdAt;

    @Column(name = "q_edited")
    private Instant editedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "emp_id")
    private User createdBy;


}