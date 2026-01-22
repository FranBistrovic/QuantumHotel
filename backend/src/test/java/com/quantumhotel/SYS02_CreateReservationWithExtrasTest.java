package com.quantumhotel;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SYS02_CreateReservationWithExtrasTest extends BaseE2ETest {

    @Test
    void SYS02_createReservation_withExtras_shouldSucceed() throws InterruptedException {
        ensureAuthenticatedIfPossible();

        openApp(FrontendRoutes.reservations());

        By dateFrom = By.id("dateFrom");
        By dateTo   = By.id("dateTo");
        By persons   = By.id("persons");

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
        click(By.cssSelector("#room-1"));
        click(By.cssSelector("#addon-1"));
        click(By.cssSelector("#rezervirajBtn"));

        boolean successToast = !driver.findElements(By.cssSelector("#resultMessage")).contains("Rezervacija uspješno kreirana!");

        assertTrue(successToast, "Očekivana potvrda rezervacije.");
    }
}