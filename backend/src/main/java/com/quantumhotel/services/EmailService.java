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
        mailMessage.setTo(domain);
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

    public void sendReservationConfirmed(String to, Long reservationId) {
        sendEmail(
                to,
                "Reservation Confirmed",
                "Your reservation #" + reservationId + " has been CONFIRMED.\n\n"
                        + domain
        );
    }

    public void sendReservationRejected(String to, Long reservationId, String reason) {
        sendEmail(
                to,
                "Reservation Rejected",
                "Your reservation #" + reservationId + " has been REJECTED.\n\n"
                        + (reason != null ? "Reason: " + reason + "\n\n" : "")
                        + domain
        );
    }

}
