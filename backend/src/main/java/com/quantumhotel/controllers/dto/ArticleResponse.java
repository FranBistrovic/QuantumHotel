package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ArticleResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime created;
    private LocalDateTime edited;

    // getters & setters
}