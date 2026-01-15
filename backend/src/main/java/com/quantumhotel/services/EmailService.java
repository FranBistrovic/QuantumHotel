package com.quantumhotel.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;


@Service
public class EmailService {
    @Value("${app.domain}")
    private String domain;

    @Value("${app.support.email}")
    private String support;

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        String link = domain + "/api/auth/verify?token=" + token;

        String html = emailTemplate(
                "Welcome to Quantum Hotel ✨",
                "Thank you for creating an account with us!",
                "Verify your email address by clicking the button below:",
                "Verify Account",
                link
        );

        sendHtmlEmail(to, "Verify your Quantum Hotel account", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String link = domain + "/reset-password?token=" + token;

        String html = emailTemplate(
                "Reset Your Password 🔐",
                "We received a request to reset your password.",
                "Click the button below to continue:",
                "Reset Password",
                link
        );
    }
    public void sendSupportQuestion(String senderEmail, String senderName, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(support);
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

        public void sendReservationConfirmed(String to, Long reservationId) {
            String html = emailTemplate(
                    "Reservation Confirmed 🎉",
                    "Your reservation #" + reservationId + " has been confirmed!",
                    "We look forward to welcoming you.",
                    null,
                    null
            );

            sendHtmlEmail(to, "Reservation Confirmed", html);
        }

        public void sendReservationRejected(String to, Long reservationId, String reason) {
            String html = emailTemplate(
                    "Reservation Rejected",
                    "Your reservation #" + reservationId + " has been rejected.",
                    reason != null ? reason : "No reason was provided.",
                    null,
                    null
            );

            sendHtmlEmail(to, "Reservation Update", html);
        }

    public void sendReservationUpdated(String to, Long reservationId, LocalDate from, LocalDate toDate) {
        String html = emailTemplate(
                "Reservation Updated",
                "Your reservation #" + reservationId + " has been updated.",
                "New date: " +"from: " + from +"to: "+toDate,
                null,
                null
        );

        sendHtmlEmail(to, "Reservation Update", html);
    }
        private void sendHtmlEmail(String to, String subject, String htmlContent) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true); // true = HTML

                mailSender.send(message);
            } catch (MessagingException e) {
                throw new RuntimeException("Failed to send email", e);
            }
        }

        // Reusable HTML template
        private String emailTemplate(String title, String intro, String message, String buttonText, String buttonLink) {
            // Determine if button should be included
            boolean includeButton = buttonText != null && !buttonText.isBlank() && buttonLink != null && !buttonLink.isBlank();

            return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f8;
                    padding: 20px;
                    margin: 0;
                }
                .container {
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px
                }
                h1 {
                    color: #2c3e50;
                    font-size: 20px;
                    margin-bottom: 15px;
                }
                p {
                    color: #555;
                    line-height: 1.5;
                    font-size: 14px;
                    margin: 8px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #2c3e50;
                    color: #5c1313;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>%s</h1>
                <p>%s</p>
                <p>%s</p>
                %s
                <div class="footer">
                    <p>© Quantum Hotel</p>
                </div>
            </div>
        </body>
        
        
        </html>
        """.formatted(
                    title,
                    intro,
                    message,
                    includeButton ? "<a class=\"button\" href=\"" + buttonLink + "\">" + buttonText + "</a>" : ""
            );
        }

}
