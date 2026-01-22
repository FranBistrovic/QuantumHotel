package com.quantumhotel;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SYS05_NonExistingFeatureTest extends BaseE2ETest {

    @Test
    void SYS05_nonExistingRoute_shouldShow404OrNotFoundMessage() {
        openApp(FrontendRoutes.notFoundProbe());

        String src = driver.getPageSource().toLowerCase();
        boolean looksLike404 =
                src.contains("404")
                        || src.contains("This page could not be found.")
                        || driver.getCurrentUrl().contains("404");

        assertTrue(looksLike404, "Očekivan 404/not found prikaz za nepostojeću rutu.");
    }
}