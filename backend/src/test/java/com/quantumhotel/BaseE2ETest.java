package com.quantumhotel;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public abstract class BaseE2ETest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    /**
     * Pokretanje:
     *   mvn test -DbaseUrl=http://localhost:3000 -Dheadless=true -DJSESSIONID=...
     */
    protected String baseUrl() {
        return System.getProperty("baseUrl", "http://localhost:3000");
    }

    protected boolean headless() {
        return Boolean.parseBoolean(System.getProperty("headless", "true"));
    }

    protected Duration timeout() {
        return Duration.ofSeconds(Long.parseLong(System.getProperty("timeoutSeconds", "12")));
    }

    protected String jsessionId() {
        return System.getProperty("JSESSIONID", "");
    }

    @RegisterExtension
    TestWatcher watcher = new TestWatcher() {
        @Override
        public void testFailed(ExtensionContext context, Throwable cause) {
            try {
                takeScreenshot("FAILED_" + context.getDisplayName());
            } catch (Exception ignored) { }
        }
    };

    @BeforeEach
    void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        if (headless()) options.addArguments("--headless=new");
        options.addArguments("--window-size=1400,900");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, timeout());

        // Ako je proslijeđen -DJSESSIONID=..., postavi ga kao cookie na toj domeni
        ensureAuthenticatedIfPossible();
    }

    @AfterEach
    void tearDown() {
        if (driver != null) driver.quit();
    }

    protected void openApp(String path) {
        String url = baseUrl() + (path.startsWith("/") ? path : "/" + path);
        driver.get(url);
    }

    protected WebElement visible(By by) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(by));
    }

    protected WebElement clickable(By by) {
        return wait.until(ExpectedConditions.elementToBeClickable(by));
    }

    protected void click(By by) {
        clickable(by).click();
    }

    protected void setValueWithJs(By by, String value) {
        WebElement el = visible(by);
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', {bubbles:true}));",
                el, value
        );
    }

    protected void takeScreenshot(String name) throws Exception {
        if (!(driver instanceof TakesScreenshot)) return;

        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String safe = name.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path dir = Path.of("docs", "test-artifacts", "screenshots");
        Files.createDirectories(dir);

        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        Path dest = dir.resolve(ts + "_" + safe + ".png");
        Files.copy(src.toPath(), dest);
    }

    /**
     * Ubaci JSESSIONID cookie ako je dan kao -DJSESSIONID=...
     * Vraća true ako je cookie postavljen.
     */
    protected boolean ensureAuthenticatedIfPossible() {
        String sid = jsessionId();

        if (sid == null || sid.isBlank()) return false;

        // Selenium mora prvo otvoriti domenu prije addCookie
        driver.get(baseUrl() + "/");

        Cookie cookie = new Cookie.Builder("JSESSIONID", sid)
                .path("/")
                .isHttpOnly(true)
                .build();

        driver.manage().addCookie(cookie);
        driver.navigate().refresh();
        return true;
    }

    protected boolean isAuthenticatedUiPresent() {
        return !driver.findElements(By.cssSelector("#logoutBtn")).isEmpty();
    }
}