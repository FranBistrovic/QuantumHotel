package com.quantumhotel;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SYS04_ReservationOverlapTest extends BaseE2ETest {

    @Test
    void SYS04_reservationOverlap_shouldBeBlocked() {
        ensureAuthenticatedIfPossible();

        openApp(FrontendRoutes.reservations());

        By dateFrom = By.id("dateFrom");
        By dateTo   = By.id("dateTo");
        By persons   = By.id("persons");

        // odabrati datum za koji znamo da vec postoji rezervacija
        WebElement from = visible(dateFrom);
        from.click();
        from.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        from.sendKeys("06-02-2026");
        WebElement to = visible(dateTo);
        to.click();
        to.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        to.sendKeys("07-02-2026");
        WebElement person = visible(persons);
        person.click();
        person.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        person.sendKeys("2");

        click(By.cssSelector("#dostupneSobeBtn"));

        boolean hasError = !driver.findElements(By.cssSelector("#resultMessage")).contains("Nema dostupnih soba za odabrane datume.");
        assertTrue(hasError, "Očekivano nema dostupnih soba");
    }
}