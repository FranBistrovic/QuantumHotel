# Quantum Hotel Backend

The Quantum Hotel backend powers authentication, user management, email login, OAuth2 login, and role-based access.  
It is built using **Spring Boot**, **Spring Security**, **PostgreSQL**, and **Docker Compose**.

---

## Features

- Email/password registration  
- Email verification flow  
- Password reset via email  
- Login with Google OAuth2  
- Local or OAuth2 account support  
- Role-based authentication:  
  - USER  
  - STAFF  
  - ADMIN  
- Staff/Admin dashboards  
- JSON-based login/logout responses  
- PostgreSQL database integration  
- Docker Compose setup  

---

## application.properties

```properties
# --- GENERAL ---
spring.application.name=Quantum Hotel
spring.web.resources.add-mappings=false
app.domain=${DOMAIN:http://localhost:8080}
server.forward-headers-strategy=framework
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=None

# --- OAUTH2 ---
spring.security.oauth2.client.registration.google.client-id=REDACTED
spring.security.oauth2.client.registration.google.client-secret=REDACTED
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# --- PostgreSQL Connection ---
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/quantumhotel}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:quantum_user}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:quantum-db-password}

# --- Hibernate / JPA ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# --- Email ---
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=REDACTED
spring.mail.password=REDACTED
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```