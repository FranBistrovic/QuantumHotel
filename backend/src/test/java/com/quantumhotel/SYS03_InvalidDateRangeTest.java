package com.quantumhotel;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SYS03_InvalidDateRangeTest extends BaseE2ETest {

    @Test
    void SYS03_invalidDateRange_shouldShowValidationError() {
        ensureAuthenticatedIfPossible();

        openApp(FrontendRoutes.reservations());

        By dateFrom = By.id("dateFrom");
        By dateTo   = By.id("dateTo");
        By persons   = By.id("persons");

        WebElement from = visible(dateFrom);
        from.click();
        from.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        from.sendKeys("29-01-2026");
        WebElement to = visible(dateTo);
        to.click();
        to.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        to.sendKeys("28-01-2026");
        WebElement person = visible(persons);
        person.click();
        person.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        person.sendKeys("2");

        click(By.cssSelector("#dostupneSobeBtn"));

        boolean hasError = !driver.findElements(By.cssSelector("#resultMessage")).contains("Datum odlaska mora biti nakon datuma dolaska.");
        assertTrue(hasError, "Očekivana greška rezervacije.");
    }
}