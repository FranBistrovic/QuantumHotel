package com.quantumhotel.entity;

import com.quantumhotel.users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name = "articles")
public class Article  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "art_id")
    private Long id;

    @Column(name = "art_title")
    private String title;

    @Column(name = "art_description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "art_created")
    private LocalDateTime created;

    @Column(name = "art_edited")
    private LocalDateTime edited;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id")
    private User author;

    // getters & setters
}