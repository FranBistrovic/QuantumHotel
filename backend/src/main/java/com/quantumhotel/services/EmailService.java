package com.quantumhotel.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Value("${app.domain}")
    private String domain;

    @Value("${app.support.email}")
    private String supportEmail;

    @Autowired
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(String to, String token) {
        String link = domain + "/api/auth/verify?token=" + token;
        sendEmail(to, "Verify your Quantum Hotel account",
                "Click this link to verify your account:\n" + link);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = domain + "/reset-password?token=" + token;
        sendEmail(to, "Reset your Quantum Hotel password",
                "Click this link to reset your password:\n" + link);
    }
    public void sendSupportQuestion(String senderEmail, String senderName, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(supportEmail);
        mailMessage.setReplyTo(senderEmail);
        mailMessage.setSubject("Support Question: " + subject);
        mailMessage.setText(
                "Support Question Received\n\n" +
                        "From: " + senderName + "\n" +
                        "Email: " + senderEmail + "\n\n" +
                        "Subject: " + subject + "\n\n" +
                        "Message:\n" + message
        );
        mailSender.send(mailMessage);
    }
    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
