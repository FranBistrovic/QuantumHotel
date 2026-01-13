package com.quantumhotel.controllers.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationResponseDto {
    private double latitude;
    private double longitude;

    public LocationResponseDto() {}

    public LocationResponseDto(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}