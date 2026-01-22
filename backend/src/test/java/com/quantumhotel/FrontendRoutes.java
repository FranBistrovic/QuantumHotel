package com.quantumhotel;

public final class FrontendRoutes {

    private FrontendRoutes() {}

    public static String home() {
        return System.getProperty("route.home", "/");
    }

    public static String login() {
        return System.getProperty("route.home", "/login");
    }

    public static String rooms() {
        return System.getProperty("route.rooms", "/room-categories");
    }

    public static String reservations() {
        return System.getProperty("route.reservations", "/reservations");
    }

    public static String notFoundProbe() {
        return System.getProperty("route.notFoundProbe", "/admin/non-existing-feature");
    }
}