# Quantum Hotel Backend

Backend sustava Quantum Hotel upravlja autentifikacijom, korisničkim računima, prijavom putem e-pošte, OAuth2 prijavom i pristupom temeljenim na ulogama.
Izgrađen je korištenjem **Spring Boota**, **Spring Securityja**, **PostgreSQL-a** i **Docker Composea**.

---

## Značajke

- Registracija putem e-pošte i lozinke
- Verifikacija e-pošte
- Obnova lozinke putem e-pošte
- Prijava putem Google OAuth2
- Podrška za lokalne i OAuth2 račune
- Autentifikacija temeljena na ulogama:
  - USER
  - STAFF
  - ADMIN
- JSON odgovori za prijavu/odjavu
- Integracija s PostgreSQL bazom podataka
- Docker Compose konfiguracija

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
