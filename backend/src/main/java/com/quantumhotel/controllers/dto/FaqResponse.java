package com.quantumhotel.controllers.dto;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FaqResponse {

    private Long id;
    private String question;
    private String answer;
    private LocalDateTime created;
    private LocalDateTime edited;

    // getters & setters
}