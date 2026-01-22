package com.quantumhotel;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SYS01_OAuth2RedirectTest extends BaseE2ETest {

    @Test
    void SYS01_googleOAuth2Redirect_shouldNavigateToGoogleOrOauthEndpoint() {
        openApp(FrontendRoutes.login());

        click(By.cssSelector(".google-button2"));

        String url = driver.getCurrentUrl();

        boolean ok = url.contains("accounts.google.com")
                || url.contains("/oauth2/authorization/google")
                || url.toLowerCase().contains("oauth2");

        assertTrue(ok, "Očekivan OAuth2 redirect. Dobiveno: " + url);
    }
}