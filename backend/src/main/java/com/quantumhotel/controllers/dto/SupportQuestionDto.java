package com.quantumhotel.controllers.dto;

import lombok.Data;

@Data
public class SupportQuestionDto {
    private String subject;
    private String message;
    private String senderEmail;
    private String senderName;
}