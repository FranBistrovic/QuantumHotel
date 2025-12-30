package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class FaqRequest {

    private String question;
    private String answer;

}